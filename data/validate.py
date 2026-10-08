import json, re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
read = lambda name: json.loads((root / "data" / name).read_text(encoding="utf-8"))
curriculum = read("curriculum.json")
modules = curriculum["modules"]
courses, books, papers = read("courses.json"), read("books.json"), read("papers.json")
resources = read("resources.json")
plan = read("first-28-days.json")["days"]
errors = []
def unique(items, name):
    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        errors.append(f"Duplicate IDs in {name}")
    return set(ids)
mids = unique(modules, "modules")
cids = unique(courses, "courses")
unique(books, "books")
unique(papers, "papers")
rids = unique(resources, "resources")
dids = unique(plan, "days")
topics = set()
for m in modules:
    if m["course"] not in cids:
        errors.append(f"Unknown course in {m['id']}")
    for prerequisite in m["prerequisites"]:
        if prerequisite not in mids:
            errors.append(f"Unknown prerequisite in {m['id']}")
    for gi, group in enumerate(m["groups"], 1):
        for ti, topic in enumerate(group["topics"], 1):
            topics.add(f"{m['id']}.{gi:02}.{ti:02}")
graph = {m["id"]: m["prerequisites"] for m in modules}
visited, active = set(), set()
def visit(node):
    if node in active:
        errors.append(f"Prerequisite cycle at {node}")
        return
    if node in visited:
        return
    active.add(node)
    for dep in graph.get(node, []):
        visit(dep)
    active.remove(node)
    visited.add(node)
for node in graph:
    visit(node)
seen = set()
for day in plan:
    if not set(day["prerequisites"]) <= seen:
        errors.append(f"Unmet or out-of-order day prerequisite: {day['id']}")
    if day["resourceId"] not in rids:
        errors.append(f"Unknown resource: {day['id']}")
    for tid in day["topicIds"]:
        if tid not in topics:
            errors.append(f"Unknown topic: {day['id']} -> {tid}")
    if not set(day["moduleIds"]) <= mids:
        errors.append(f"Unknown module: {day['id']}")
    seen.add(day["id"])
for p in papers:
    if p["after"] not in mids:
        errors.append(f"Unknown paper prerequisite: {p['id']}")
    if p["verification"] != "landing-page-and-abstract-reviewed":
        errors.append(f"Unverified paper: {p['id']}")
extensions = read("learning-extensions.json")["units"]
unique(extensions, "extensions")
xtopics = set()
for unit in extensions:
    if not set(unit["prerequisites"]) <= mids:
        errors.append(f"Unknown extension prerequisite: {unit['id']}")
    for topic in unit["topics"]:
        if topic["id"] in xtopics:
            errors.append(f"Duplicate extension topic: {topic['id']}")
        xtopics.add(topic["id"])
videos = read("video-companions.json")
unique(videos, "video companions")
for video in videos:
    if not set(video["modules"].split("/")) <= mids:
        errors.append(f"Unknown video module: {video['id']}")
saved = read("saved-material-review.json")
unique(saved["projects"], "saved projects")
if len(saved["projects"]) != 20:
    errors.append("Expected 20 reviewed project ideas")
# Curriculum documents only. App/node_modules and supplied UI skills have separate checks.
mdfiles = list(root.glob("*.md")) + list((root / "templates").glob("*.md"))
for path in mdfiles:
    content = path.read_text(encoding="utf-8")
    for label, link in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content):
        if link.startswith(("https:", "http:", "#", "mailto:")):
            continue
        target = (path.parent / link.split("#")[0]).resolve()
        if not target.exists():
            errors.append(f"Broken local link: {path.name}: {link}")
    if content.count("```") % 2:
        errors.append(f"Unbalanced fences: {path.name}")
depth = read("deep-topic-map.json")["domains"]
unique(depth, "depth domains")
depth_topics = [t for d in depth for t in d["topics"]]
depth_outcomes = [o for t in depth_topics for o in t["outcomes"]]
unique(depth_topics, "depth topics")
unique(depth_outcomes, "depth outcomes")
available_depth_resources = {r["id"] for r in resources + videos}
for domain in depth:
    for prerequisite in domain["prerequisites"]:
        if prerequisite not in mids:
            errors.append(f"Unknown depth prerequisite: {prerequisite}")
    for resource in domain["resources"]:
        if resource not in available_depth_resources:
            errors.append(f"Unknown depth resource: {resource}")
    if not domain["assessment"]:
        errors.append(f"Missing depth assessment: {domain['id']}")
registry = read("tool-registry.json")
report = {
    "status": "passed" if not errors else "failed",
    "modules": len(modules),
    "concepts": len(topics),
    "estimatedHours": sum(m["hours"] for m in modules),
    "courses": len(courses),
    "booksOrReferences": len(books),
    "papers": len(papers),
    "toolCategories": len(registry),
    "illustrativeToolEntries": sum(len(t["tools"]) for t in registry),
    "firstMonthDays": len(plan),
    "videoCompanions": len(videos),
    "extensionUnits": len(extensions),
    "extensionTopics": len(xtopics),
    "reviewedProjectIdeas": len(saved["projects"]),
    "markdownFiles": len(mdfiles),
    "depthDomains": len(depth),
    "depthTopics": len(depth_topics),
    "depthOutcomes": len(depth_outcomes),
    "errors": errors,
    "scope": "Local consistency only; no claim of all external links or code execution being verified."
}
(root / "data" / "validation-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
raise SystemExit(1 if errors else 0)
