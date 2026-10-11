from .models import RoadmapStage, RoadmapSkill

STAGE_TEMPLATE = ["Foundation", "Core Skills", "Specialization", "Portfolio & Projects"]
STAGE_DURATIONS = ["2–3 Weeks", "3–4 Weeks", "3–4 Weeks", "2–3 Weeks"]
STAGE_DESCRIPTIONS = [
    "Build a strong foundation in the core tools and concepts for this career.",
    "Develop the core technical skills required for this career path.",
    "Go deeper into specialized skills that set you apart in this field.",
    "Apply your skills to practical projects and build a portfolio.",
]


def generate_roadmap_for_user(user_id, career):
    """
    Rebuilds this user's roadmap from a CareerDefinition instance,
    using matched vs missing skills to decide stage/skill status.
    """
    RoadmapStage.objects.filter(user_id=user_id).delete()

    all_skills = career.skills_list()
    if not all_skills:
        return

    # Split skills evenly across the 4 stage buckets, in order
    stage_count = len(STAGE_TEMPLATE)
    buckets = [[] for _ in range(stage_count)]
    for index, skill in enumerate(all_skills):
        buckets[index % stage_count].append(skill)

    matched_set = set(career.matched_skills_for(user_id)) if hasattr(career, 'matched_skills_for') else None

    current_assigned = False  # only mark one skill "current" overall

    for stage_index, skill_names in enumerate(buckets):
        if not skill_names:
            continue

        stage = RoadmapStage.objects.create(
            user_id=user_id,
            name=STAGE_TEMPLATE[stage_index],
            description=STAGE_DESCRIPTIONS[stage_index],
            duration=STAGE_DURATIONS[stage_index],
            status='upcoming',  # set correctly below
            order=stage_index + 1,
        )

        stage_statuses = []
        for skill_name in skill_names:
            is_matched = matched_set is not None and skill_name in matched_set

            if is_matched:
                status = 'completed'
                progress = 100
            elif not current_assigned:
                # A recommended roadmap is not evidence of completed learning.
                # Keep the first milestone available, but at zero progress.
                status = 'current'
                progress = 0
                current_assigned = True
            else:
                status = 'upcoming'
                progress = 0

            RoadmapSkill.objects.create(
                stage=stage,
                name=skill_name,
                status=status,
                progress=progress,
            )
            stage_statuses.append(status)

        # Stage status = completed if all skills completed,
        # current if any skill is current, else upcoming
        if all(s == 'completed' for s in stage_statuses):
            stage.status = 'completed'
        elif 'current' in stage_statuses:
            stage.status = 'current'
        else:
            stage.status = 'upcoming'
        stage.save()


def sync_roadmap_progress(user_id):
    """
    Keeps the roadmap in step with the student's learning tasks.

    A roadmap skill's progress is the average completion of the tasks for that
    skill, and skill / stage statuses follow from it. Skills without any task
    keep whatever progress they already have. Safe to call repeatedly.
    """
    from collections import defaultdict
    from tasks.models import Task

    stages = list(
        RoadmapStage.objects.filter(user_id=user_id).order_by('order', 'id').prefetch_related('skills')
    )
    if not stages:
        return

    pct_by_skill = defaultdict(list)
    for task in Task.objects.filter(user_id=user_id):
        if task.skill:
            pct_by_skill[task.skill.strip().lower()].append(task.percent)

    ordered = [(stage, sk) for stage in stages for sk in sorted(stage.skills.all(), key=lambda x: x.id)]

    for _, sk in ordered:
        values = pct_by_skill.get(sk.name.strip().lower())
        if values:
            sk.progress = round(sum(values) / len(values))

    # The first unfinished skill is always the "current" one; any skill the
    # student has started is also in progress.
    active = next((sk for _, sk in ordered if sk.progress < 100), None)
    for _, sk in ordered:
        if sk.progress >= 100:
            sk.status = 'completed'
        elif sk.progress > 0 or sk is active:
            sk.status = 'current'
        else:
            sk.status = 'upcoming'

    RoadmapSkill.objects.bulk_update([sk for _, sk in ordered], ['progress', 'status'])

    for stage in stages:
        statuses = [sk.status for sk in stage.skills.all()]
        if statuses and all(x == 'completed' for x in statuses):
            new_status = 'completed'
        elif 'current' in statuses:
            new_status = 'current'
        else:
            new_status = 'upcoming'
        if stage.status != new_status:
            stage.status = new_status
            stage.save(update_fields=['status'])
