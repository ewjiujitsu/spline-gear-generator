# Involute Spline & Gear DXF Generator

A single-page browser tool that turns data-sheet parameters into a DXF profile you
can import straight into CAD.

Everything runs in the browser. There is no build step, no dependency to install,
and the page makes **no network requests of any kind** — open `index.html` from
disk and it works exactly as it does when hosted, offline included. Its fonts
(Barlow, Barlow Condensed, Share Tech Mono — SIL Open Font License 1.1) are
embedded in the page; their copyright notices and the licence text are in
`index.html`, in the `embedded-fonts` style block.

## What it produces

- **Involute splines**, internal and external — ANSI B92.1 / ISO 4156 / DIN 5480
- **Spur and helical gears**, external, normal module system (DIN 3960 transverse derivation)
- **Soft stage (pre heat treat)** — a roughing profile at a stock allowance added to the
  base tangent and root ∅, which is exactly an allowance/2-per-flank normal offset
- **Coating stages** — enter a per-surface coating thickness band and get the
  pre-coating size to machine and the post-coating finished size, with the
  tolerance consequences worked out
- **GO / NO-GO gauges** — the mating profile at the max-material effective and least-material actual limits, with the effective pair carried through the soft, coating and HT stages
- **Tables** — rough vs finish, finished data, gear data, machine setup and coating,
  each exportable as `.csv` for CAD table import
- **History** — every part you generate is logged locally with the complete input
  set, so any past profile can be reloaded and reproduced exactly

## Tooth patterns

Beyond a normal full-tooth spline it will build alternate-tooth forms (DIN `z(Z)`,
both missing-gap and missing-tooth), and single missing gap or missing tooth at a
chosen angular position — the position snaps to the nearest valid feature and
reports the snapped angle and index back.

## Running it

The simplest way is to open `index.html` in a browser. Nothing else is required.

To serve it instead:

```bash
npm start
```

That runs a dependency-free static server on `PORT` (default 3000). On Railway,
Render, Fly or similar, point the platform at this repo — it will detect Node,
run `npm start`, and inject `PORT` itself. No configuration needed.

## Units

There is a single mm/inch master switch. Fields, readouts, tables and the report
all follow it; internally everything is metric, so the geometry is identical
either way. Flipping the switch converts the values you have typed in place.

Every numeric field is also a calculator — type `3*2` or `45.5/2+0.25`, press
Enter or leave the field, and it becomes the result.

## Accuracy notes

- Geometry is always cut at the **MID** of whatever tolerance band you enter.
- Tip and root ∅ can be entered as an exact value, an ISO 286 nominal + letter +
  grade, or as any two of min/mid/max with the third computed.
- The involute engine is shared by every output. The soft stage, the coating
  stages and the gauges are all the same engine with shifted inputs rather than
  separate maths, so they cannot drift apart from the finished profile.
- The version badge in the header identifies the build. Quote it when reporting
  anything unexpected.

## Verifying a change

The profile is deterministic: identical inputs always produce an identical DXF
string. The practical regression test is to record the length and a hash of the
generated DXF for a spread of configurations before a change and compare after —
anything unintended shows up immediately as a differing hash.
