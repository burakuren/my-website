#!/usr/bin/env python3
"""Unpack a Claude Design HTML export into readable files.

Exports are self-extracting bundles: a `__bundler/manifest` script holds
base64 (optionally gzipped) assets keyed by UUID, `__bundler/template` holds
the page HTML with UUIDs where asset URLs go, and multi-board exports nest one
bundle per board (listed in `__bundler/page_order`). This walks all of it and
writes plain files:

    python3 -I scripts/unpack-design.py "design/<export>.html" /tmp/design-out

Output: one folder per board (named after its label, e.g. "Home — dark"),
each with `index.html` (the template, asset UUIDs rewritten to file names)
plus the extracted fonts, scripts, images and nested component HTML. Boards
are "dc" components: markup uses {{c.bg}}-style placeholders and the logic
(theme colours, data, embedded images) sits in the `text/x-dc` script.
"""

import base64
import gzip
import json
import re
import sys
from pathlib import Path

EXT = {
    "text/html": "html",
    "text/css": "css",
    "text/javascript": "js",
    "application/javascript": "js",
    "font/woff2": "woff2",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "image/webp": "webp",
}


def block(html: str, kind: str):
    m = re.search(rf'<script type="__bundler/{re.escape(kind)}">\s*(.*?)\s*</script>', html, re.S)
    return json.loads(m.group(1)) if m else None


def safe(name: str) -> str:
    return re.sub(r'[/\\:*?"<>|]+', "-", name).strip() or "board"


def unpack(html: str, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    manifest = block(html, "manifest") or {}
    template = block(html, "template") or ""
    order = block(html, "page_order") or []

    # Labels for nested boards come from <h2>Label</h2><iframe src="about:blank#uuid">.
    labels = dict((u, l) for l, u in re.findall(r'<h2>(.*?)</h2><iframe src="about:blank#([0-9a-f-]+)"', template))

    for uuid, entry in manifest.items():
        data = base64.b64decode(entry["data"])
        if entry.get("compressed"):
            data = gzip.decompress(data)
        if uuid in order:
            unpack(data.decode("utf-8"), out / safe(labels.get(uuid, uuid)))
            continue
        name = f"{uuid}.{EXT.get(entry['mime'], 'bin')}"
        (out / name).write_bytes(data)
        template = template.replace(uuid, name)

    (out / "index.html").write_text(template, encoding="utf-8")
    print(out)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    unpack(Path(sys.argv[1]).read_text(encoding="utf-8"), Path(sys.argv[2]))
