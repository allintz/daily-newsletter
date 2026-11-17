#!/usr/bin/env python3
"""Copy episodes into the published podcast folder and merge them into feed.xml.

Usage: add_to_feed.py <episodes_dir> <published_podcast_dir>
Existing feed items are kept; an episode with the same guid is replaced.
"""
import glob, json, os, re, shutil, sys
from email.utils import parsedate_to_datetime
from xml.sax.saxutils import escape

REPO_RAW = "https://raw.githubusercontent.com/allintz/democracy-newsletter/main/podcast"
REPO_WEB = "https://github.com/allintz/democracy-newsletter/blob/main/podcast"
BASE = "https://allintz.github.io/democracy-newsletter/podcast"

HEADER = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Deep Democracy Learning</title>
    <link>{BASE}</link>
    <description>Daily audio briefing on voter subversion, election integrity, and threats to democracy in America</description>
    <language>en-us</language>
    <itunes:author>Democracy Watch</itunes:author>
    <itunes:category text="News">
      <itunes:category text="Politics"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="{BASE}/artwork.jpg"/>
"""


def item_xml(m):
    desc = m["description"]
    if m.get("notes"):
        desc += f" Sources and full analysis: {REPO_WEB}/notes/{m['slug']}.md"
    return f"""    <item>
      <title>{escape(m['title'])}</title>
      <description>{escape(desc)}</description>
      <pubDate>{m['pubDate']}</pubDate>
      <enclosure url="{REPO_RAW}/{m['file']}" length="{m['bytes']}" type="audio/mpeg"/>
      <guid isPermaLink="false">{m['file']}</guid>
      <itunes:duration>{m['duration']}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>"""


def when(item):
    try:
        return parsedate_to_datetime(re.search(r"<pubDate>([^<]+)", item).group(1))
    except Exception:
        return parsedate_to_datetime("Thu, 01 Jan 1970 00:00:00 GMT")


def main(episodes_dir, dest):
    os.makedirs(os.path.join(dest, "notes"), exist_ok=True)
    feed_path = os.path.join(dest, "feed.xml")
    header, items = HEADER, []
    if os.path.exists(feed_path):
        old = open(feed_path, encoding="utf-8").read()
        items = re.findall(r"<item>[\s\S]*?</item>", old)
        cut = old.find("<item>") if items else old.find("</channel>")
        if cut > 0:
            header = old[:cut].rstrip() + "\n"

    for path in sorted(glob.glob(os.path.join(episodes_dir, "*", "episode.json"))):
        m = json.load(open(path, encoding="utf-8"))
        src = os.path.dirname(path)
        shutil.copyfile(os.path.join(src, m["file"]), os.path.join(dest, m["file"]))
        if m.get("notes"):
            shutil.copyfile(os.path.join(src, m["notes"]), os.path.join(dest, "notes", m["slug"] + ".md"))
        items = [i for i in items if f">{m['file']}</guid>" not in i]
        items.append(item_xml(m).strip())
        print("published", m["file"])

    items.sort(key=when, reverse=True)
    body = "\n".join("    " + i for i in items)
    with open(feed_path, "w", encoding="utf-8") as f:
        f.write(f"{header}{body}\n  </channel>\n</rss>\n")
    print(f"feed has {len(items)} episode(s)")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
