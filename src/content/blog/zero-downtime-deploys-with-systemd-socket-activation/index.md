---
title: Zero-downtime deploys with systemd socket activation
description: Keep connections queued in the kernel while your service restarts, no load balancer required.
pubDate: 2026-09-14
tags:
  - linux
  - devops
category: linux
draft: false
---

## The problem

A typical deploy replaces a binary and restarts the service. Between the old process exiting and the new one calling `listen()`, connections to the port are refused. For a single-instance service, that gap is the outage your users actually see.

> The fix isn't a faster restart. It's making sure someone is always holding the socket.

## How socket activation works

systemd opens the listening socket itself, then hands it to your service as an inherited file descriptor. When the service restarts, the socket never closes: new connections wait in the kernel's accept backlog until the new process picks them up.

1. systemd creates and binds the socket from a `.socket` unit.
2. On the first connection, it starts the matching `.service`.
3. The service receives the socket as file descriptor 3, with `LISTEN_FDS=1` set.
4. On restart, only the process changes; the socket stays put.

## The unit files

Two small files. The socket unit owns the port; the service unit owns the process.

```ini title="api.socket + api.service"
# /etc/systemd/system/api.socket
[Socket]
ListenStream=8080

[Install]
WantedBy=sockets.target

# /etc/systemd/system/api.service
[Service]
ExecStart=/usr/local/bin/api
Restart=on-failure
```

Enable the socket, not the service:

```bash
sudo systemctl enable --now api.socket
curl -s localhost:8080/health          # first request starts api.service
sudo systemctl restart api.service     # socket stays open
```

> [!NOTE]
> The service unit doesn't need its own `[Install]` section: the socket starts it on demand.

## Teaching the app to accept the socket

Your app has to use the inherited socket instead of opening its own. Most ecosystems have a small helper (`sd_listen_fds()` in C, go-systemd's activation package in Go), or you can read `LISTEN_FDS` yourself and wrap fd 3.

## Trade-offs

| Approach | During restart | Moving parts |
| --- | --- | --- |
| Plain restart | Connections refused | None |
| **Socket activation** | Connections wait in the backlog | One extra unit file |
| Two instances + load balancer | No interruption | Proxy, health checks, 2× resources |

Socket activation won't help if startup takes longer than clients are willing to wait, and it doesn't cover schema changes or long-lived connections. For a single box, though, it's the cheapest win I know.
