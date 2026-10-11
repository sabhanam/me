"""Build resume/Sabhanam-Sree-Sai-Ram-Resume.pdf from data/profile.json.

Writes resume.html, then prints it with headless Chrome. No phone number:
contact is email, LinkedIn and GitHub only.
"""
import html
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_HTML = ROOT / "resume" / "resume.html"
OUT_PDF = ROOT / "resume" / "Sabhanam-Sree-Sai-Ram-Resume.pdf"

p = json.loads((ROOT / "data" / "profile.json").read_text())
e = lambda s: html.escape(s, quote=True)

exp_html = "".join(
    f"""<div class="job">
      <div class="job-head"><span class="role">{e(x['role'])}</span><span class="period">{e(x['period'])}</span></div>
      <div class="company">{e(x['company'])} · {e(x['place'])}</div>
      <ul>{''.join(f'<li>{e(b)}</li>' for b in x['bullets'])}</ul>
    </div>"""
    for x in p["experience"]
)

proj_html = "".join(
    f"""<div class="proj">
      <div class="job-head"><span class="role">{e(x['name'])}</span><span class="period">{e(x['kind'])}</span></div>
      <p>{e(x['summary'])}{(' ' + e(x['drives'])) if x['drives'] else ''}</p>
      <p class="stack">{e(' · '.join(x['stack']))}</p>
    </div>"""
    for x in p["projects"]
)

skills_html = "".join(
    f"<tr><th>{e(k)}</th><td>{e(', '.join(v))}</td></tr>" for k, v in p["skills"].items()
)

doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{e(p['shortName'])} · Resume</title>
<style>
  @page {{ size: A4; margin: 14mm 15mm; }}
  body {{ font: 9.6pt/1.42 "Instrument Sans", Helvetica, Arial, sans-serif; color: #1b1a2e; margin: 0; }}
  header {{ display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1b1a2e; padding-bottom: 8px; }}
  h1 {{ font: 600 22pt/1 Georgia, serif; margin: 0 0 4px; }}
  .headline {{ font-weight: 600; color: #7a4b00; margin: 0; }}
  .contact {{ text-align: right; font-size: 9pt; }}
  .contact a {{ color: #1b1a2e; text-decoration: none; }}
  h2 {{ font: 600 10.5pt Georgia, serif; text-transform: none; margin: 14px 0 6px; border-bottom: 1px solid #d6d2e6; padding-bottom: 3px; }}
  p {{ margin: 0 0 6px; }}
  .job, .proj {{ margin-bottom: 9px; break-inside: avoid; }}
  .job-head {{ display: flex; justify-content: space-between; gap: 12px; }}
  .role {{ font-weight: 700; }}
  .period {{ color: #5c5878; white-space: nowrap; }}
  .company {{ color: #5c5878; margin-bottom: 3px; }}
  ul {{ margin: 0; padding-left: 16px; }}
  li {{ margin-bottom: 2px; }}
  .stack {{ color: #5c5878; font-size: 8.8pt; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th {{ text-align: left; width: 22%; font-weight: 600; vertical-align: top; padding: 1px 8px 1px 0; }}
  td {{ padding: 1px 0; }}
</style></head>
<body>
<header>
  <div>
    <h1>{e(p['shortName'])}</h1>
    <p class="headline">{e(p['headline'].split('·')[0].strip())}</p>
  </div>
  <div class="contact">
    <div><a href="mailto:{e(p['links']['email'])}">{e(p['links']['email'])}</a></div>
    <div><a href="{e(p['links']['linkedin'])}">linkedin.com/in/ram-sabhanam</a></div>
    <div><a href="{e(p['links']['github'])}">github.com/sabhanam</a></div>
  </div>
</header>

<h2>Profile</h2>
<p>{e(p['about'][0])}</p>

<h2>Experience</h2>
{exp_html}

<h2>Projects and open source</h2>
{proj_html}

<h2>Skills</h2>
<table>{skills_html}</table>

<h2>Education</h2>
<p><span class="role">{e(p['education'][0]['school'])}</span> · {e(p['education'][0]['place'])} · Graduated {e(p['education'][0]['year'])}</p>
</body></html>"""

OUT_HTML.write_text(doc)
subprocess.run(
    [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
     f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri()],
    check=True, capture_output=True,
)
OUT_HTML.unlink()  # keep the repo clean; the PDF is the artifact
print(f"wrote {OUT_PDF}")
