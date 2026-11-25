"""בניית אינדקס הפוך לעין משפט מתוך קבצי הקישורים של ספריא.

קלט:  data/raw/sefaria_links/links*.csv
       (מקור: https://storage.googleapis.com/sefaria-export/links/linksN.csv)
פלט:  output/{rambam,shulchan_arukh,tur}.json ו-.csv
"""
import csv, glob, json, re, collections, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "sefaria_links"
OUT = ROOT / "output"
EM_TYPES = {"ein mishpat / ner mitsvah", "ein mishpat"}
TARGETS = {
    "rambam": "Mishneh Torah, ",
    "shulchan_arukh": "Shulchan Arukh, ",
    "tur": "Tur, ",
}


def natural_key(ref):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", ref)]


def classify(text):
    for name, prefix in TARGETS.items():
        if text.startswith(prefix):
            return name
    return None


def main():
    index = {k: collections.defaultdict(set) for k in TARGETS}
    for f in sorted(glob.glob(str(RAW / "links*.csv"))):
        with open(f, encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r["Conection Type"] not in EM_TYPES:
                    continue
                pairs = [(r["Citation 1"], r["Category 1"], r["Citation 2"], r["Category 2"]),
                         (r["Citation 2"], r["Category 2"], r["Citation 1"], r["Category 1"])]
                for src, scat, dst, _ in pairs:
                    if scat != "Talmud":
                        continue
                    kind = classify(dst)
                    if kind:
                        index[kind][dst].add(src)

    OUT.mkdir(exist_ok=True)
    for kind, mapping in index.items():
        rows = {k: sorted(v, key=natural_key) for k, v in sorted(mapping.items(), key=lambda kv: natural_key(kv[0]))}
        (OUT / f"{kind}.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
        with open(OUT / f"{kind}.csv", "w", encoding="utf-8", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["target", "talmud_sources"])
            for k, v in rows.items():
                w.writerow([k, " | ".join(v)])
        print(f"{kind}: {len(rows)} targets, {sum(len(v) for v in rows.values())} links")


if __name__ == "__main__":
    main()
