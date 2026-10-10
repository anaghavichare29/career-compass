"""
Learning content for roadmap skills.

Each skill maps to:
  what_to_learn  - the topics to cover
  why_it_matters - why the skill matters for the career
  resources      - 3 free, well-known learning resources

Skills not listed here get a sensible generic version via get_skill_content().
"""

SKILL_CONTENT = {
    # ---------------- Data ----------------
    "Excel": {
        "what_to_learn": "Cell references, formulas (SUM, IF, VLOOKUP/XLOOKUP), sorting and filtering, pivot tables, charts and basic data cleaning.",
        "why_it_matters": "Excel is the most common first tool for organising and analysing data in almost every business.",
        "resources": [
            {"title": "ExcelJet - Formulas and Functions", "url": "https://exceljet.net/"},
            {"title": "Microsoft Excel Help and Learning", "url": "https://support.microsoft.com/excel"},
            {"title": "Chandoo - Excel Tutorials", "url": "https://chandoo.org/"},
        ],
    },
    "SQL": {
        "what_to_learn": "SELECT queries, WHERE filters, JOINs, GROUP BY and aggregates, subqueries and basic table design.",
        "why_it_matters": "Most business data lives in databases, and SQL is how analysts and engineers get it out.",
        "resources": [
            {"title": "SQLBolt - Interactive SQL Lessons", "url": "https://sqlbolt.com/"},
            {"title": "Mode - SQL Tutorial", "url": "https://mode.com/sql-tutorial/"},
            {"title": "W3Schools SQL Tutorial", "url": "https://www.w3schools.com/sql/"},
        ],
    },
    "Statistics": {
        "what_to_learn": "Mean, median and spread, probability, distributions, sampling, hypothesis testing and correlation.",
        "why_it_matters": "Statistics lets you separate real patterns from noise and back up decisions with evidence.",
        "resources": [
            {"title": "Khan Academy - Statistics and Probability", "url": "https://www.khanacademy.org/math/statistics-probability"},
            {"title": "Seeing Theory - Visual Intro to Statistics", "url": "https://seeing-theory.brown.edu/"},
            {"title": "StatQuest (YouTube)", "url": "https://www.youtube.com/@statquest"},
        ],
    },
    "Python": {
        "what_to_learn": "Syntax, data types, loops, functions, lists and dictionaries, file handling and libraries like pandas.",
        "why_it_matters": "Python is the main language for data work, automation and machine learning.",
        "resources": [
            {"title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
            {"title": "Python for Everybody", "url": "https://www.py4e.com/"},
            {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/"},
        ],
    },
    "Data Visualization": {
        "what_to_learn": "Choosing the right chart, colour and layout basics, building dashboards and telling a story with data.",
        "why_it_matters": "Good visuals turn raw numbers into insights that non-technical people can act on.",
        "resources": [
            {"title": "The Data Visualisation Catalogue", "url": "https://datavizcatalogue.com/"},
            {"title": "Tableau Public - Learning", "url": "https://public.tableau.com/app/resources/learning"},
            {"title": "Matplotlib Tutorials", "url": "https://matplotlib.org/stable/tutorials/index.html"},
        ],
    },
    "Machine Learning": {
        "what_to_learn": "Supervised vs unsupervised learning, regression, classification, train/test split, overfitting and model evaluation.",
        "why_it_matters": "Machine learning powers prediction, recommendation and automation across modern products.",
        "resources": [
            {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course"},
            {"title": "scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
            {"title": "Kaggle Learn", "url": "https://www.kaggle.com/learn"},
        ],
    },
    "Deep Learning": {
        "what_to_learn": "Neural networks, backpropagation, CNNs, RNNs, transformers basics and training with PyTorch or TensorFlow.",
        "why_it_matters": "Deep learning drives image, speech and language systems, the most advanced areas of AI.",
        "resources": [
            {"title": "fast.ai - Practical Deep Learning", "url": "https://www.fast.ai/"},
            {"title": "DeepLearning.AI", "url": "https://www.deeplearning.ai/"},
            {"title": "PyTorch Tutorials", "url": "https://pytorch.org/tutorials/"},
        ],
    },
    "Model Deployment": {
        "what_to_learn": "Saving models, serving them through an API, containers, monitoring and versioning with tools like MLflow.",
        "why_it_matters": "A model only creates value once it is deployed and reliably used by real applications.",
        "resources": [
            {"title": "MLflow Documentation", "url": "https://mlflow.org/docs/latest/index.html"},
            {"title": "FastAPI Documentation", "url": "https://fastapi.tiangolo.com/"},
            {"title": "Docker Get Started", "url": "https://docs.docker.com/get-started/"},
        ],
    },
    "Analytics": {
        "what_to_learn": "Defining metrics and KPIs, funnels, cohorts, A/B testing basics and reading dashboards.",
        "why_it_matters": "Analytics tells you what users actually do, so decisions are based on facts, not guesses.",
        "resources": [
            {"title": "Google Skillshop - Analytics", "url": "https://skillshop.withgoogle.com/"},
            {"title": "Mixpanel Docs", "url": "https://docs.mixpanel.com/"},
            {"title": "Kaggle Learn - Data Analysis", "url": "https://www.kaggle.com/learn"},
        ],
    },

    # ---------------- Software ----------------
    "Programming": {
        "what_to_learn": "Variables, conditions, loops, functions, basic debugging and reading other people's code.",
        "why_it_matters": "Programming fundamentals are the base for every technical role and transfer across languages.",
        "resources": [
            {"title": "CS50 - Intro to Computer Science", "url": "https://cs50.harvard.edu/x/"},
            {"title": "The Odin Project", "url": "https://www.theodinproject.com/"},
            {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/"},
        ],
    },
    "Data Structures": {
        "what_to_learn": "Arrays, linked lists, stacks, queues, hash maps, trees and graphs, with their time costs.",
        "why_it_matters": "Choosing the right structure makes programs faster and is a core topic in technical interviews.",
        "resources": [
            {"title": "VisuAlgo - Visualising Data Structures", "url": "https://visualgo.net/"},
            {"title": "GeeksforGeeks - Data Structures", "url": "https://www.geeksforgeeks.org/data-structures/"},
            {"title": "CS50 - Data Structures", "url": "https://cs50.harvard.edu/x/"},
        ],
    },
    "Algorithms": {
        "what_to_learn": "Searching, sorting, recursion, Big-O analysis, greedy methods and dynamic programming.",
        "why_it_matters": "Algorithms help you solve problems efficiently and are tested in most engineering interviews.",
        "resources": [
            {"title": "VisuAlgo", "url": "https://visualgo.net/"},
            {"title": "GeeksforGeeks - Algorithms", "url": "https://www.geeksforgeeks.org/fundamentals-of-algorithms/"},
            {"title": "LeetCode - Practice", "url": "https://leetcode.com/"},
        ],
    },
    "Git": {
        "what_to_learn": "Commits, branches, merging, pull requests, resolving conflicts and working with GitHub.",
        "why_it_matters": "Git is how teams share and track code, so every developer is expected to know it.",
        "resources": [
            {"title": "Pro Git (free book)", "url": "https://git-scm.com/book"},
            {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/"},
            {"title": "GitHub Skills", "url": "https://skills.github.com/"},
        ],
    },
    "Problem Solving": {
        "what_to_learn": "Breaking problems into steps, spotting patterns, writing pseudocode and testing edge cases.",
        "why_it_matters": "Employers value people who can approach unfamiliar problems calmly and methodically.",
        "resources": [
            {"title": "HackerRank - Practice", "url": "https://www.hackerrank.com/"},
            {"title": "LeetCode - Practice", "url": "https://leetcode.com/"},
            {"title": "Project Euler", "url": "https://projecteuler.net/"},
        ],
    },
    "JavaScript": {
        "what_to_learn": "Variables, functions, arrays and objects, the DOM, events, promises and async/await.",
        "why_it_matters": "JavaScript is the language of the web and runs in every browser.",
        "resources": [
            {"title": "MDN - Learn JavaScript", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript"},
            {"title": "javascript.info", "url": "https://javascript.info/"},
            {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/"},
        ],
    },
    "React": {
        "what_to_learn": "Components, props, state, hooks (useState, useEffect), conditional rendering and fetching data.",
        "why_it_matters": "React is one of the most widely used libraries for building modern user interfaces.",
        "resources": [
            {"title": "React - Learn", "url": "https://react.dev/learn"},
            {"title": "Full Stack Open", "url": "https://fullstackopen.com/en/"},
            {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org/"},
        ],
    },
    "Node.js": {
        "what_to_learn": "Modules, the event loop, building servers with Express, routing, middleware and connecting to a database.",
        "why_it_matters": "Node.js lets you build the backend in the same language as the frontend.",
        "resources": [
            {"title": "Node.js - Learn", "url": "https://nodejs.org/en/learn"},
            {"title": "Express Documentation", "url": "https://expressjs.com/"},
            {"title": "The Odin Project - NodeJS", "url": "https://www.theodinproject.com/"},
        ],
    },
    "Databases": {
        "what_to_learn": "Tables and relationships, primary and foreign keys, normalisation, indexes and basic transactions.",
        "why_it_matters": "Almost every application stores data, and good database design keeps it fast and reliable.",
        "resources": [
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html"},
            {"title": "Use The Index, Luke", "url": "https://use-the-index-luke.com/"},
            {"title": "SQLBolt", "url": "https://sqlbolt.com/"},
        ],
    },
    "APIs": {
        "what_to_learn": "HTTP methods and status codes, REST design, JSON, authentication and testing APIs.",
        "why_it_matters": "APIs are how frontends, services and third-party tools talk to each other.",
        "resources": [
            {"title": "MDN - HTTP Overview", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP"},
            {"title": "Postman Learning Center", "url": "https://learning.postman.com/"},
            {"title": "REST API Tutorial", "url": "https://restfulapi.net/"},
        ],
    },

    # ---------------- Product ----------------
    "Communication": {
        "what_to_learn": "Clear writing, active listening, giving feedback, presenting ideas and running effective meetings.",
        "why_it_matters": "Good ideas only land when you can explain them clearly to teammates and stakeholders.",
        "resources": [
            {"title": "Toastmasters International", "url": "https://www.toastmasters.org/"},
            {"title": "MindTools - Communication Skills", "url": "https://www.mindtools.com/"},
            {"title": "TED - Communication Talks", "url": "https://www.ted.com/topics/communication"},
        ],
    },
    "Prioritization": {
        "what_to_learn": "Frameworks like RICE, MoSCoW and impact vs effort, and how to say no with reasons.",
        "why_it_matters": "Teams have limited time, so choosing the right work first decides a product's success.",
        "resources": [
            {"title": "Atlassian - Prioritization Frameworks", "url": "https://www.atlassian.com/agile/product-management/prioritization-framework"},
            {"title": "Product School", "url": "https://productschool.com/"},
            {"title": "MindTools - Prioritization", "url": "https://www.mindtools.com/"},
        ],
    },
    "Market Research": {
        "what_to_learn": "Surveys, interviews, competitor analysis, customer segments and reading market reports.",
        "why_it_matters": "Research ensures you build something people actually want before investing time and money.",
        "resources": [
            {"title": "Think with Google", "url": "https://www.thinkwithgoogle.com/"},
            {"title": "HubSpot - Market Research Guide", "url": "https://blog.hubspot.com/marketing/market-research-buyers-journey-guide"},
            {"title": "Statista", "url": "https://www.statista.com/"},
        ],
    },
    "Roadmapping": {
        "what_to_learn": "Setting goals, turning them into themes and milestones, and sharing a roadmap with stakeholders.",
        "why_it_matters": "A clear roadmap aligns the team on what is being built and why.",
        "resources": [
            {"title": "Atlassian - Product Roadmaps", "url": "https://www.atlassian.com/agile/product-management/product-roadmaps"},
            {"title": "ProductPlan - Learn", "url": "https://www.productplan.com/learn/"},
            {"title": "Aha! - Roadmapping", "url": "https://www.aha.io/roadmapping"},
        ],
    },

    # ---------------- Design ----------------
    "Wireframing": {
        "what_to_learn": "Low-fidelity layouts, user flows, page structure and annotating wireframes for developers.",
        "why_it_matters": "Wireframes let you test ideas quickly before spending time on detailed design.",
        "resources": [
            {"title": "Balsamiq - Wireframing Guide", "url": "https://balsamiq.com/learn/"},
            {"title": "Nielsen Norman Group", "url": "https://www.nngroup.com/"},
            {"title": "Figma Help Center", "url": "https://help.figma.com/hc/en-us"},
        ],
    },
    "Figma": {
        "what_to_learn": "Frames, auto layout, components, styles, variants and sharing files with a team.",
        "why_it_matters": "Figma is the standard tool for modern UI design and designer-developer collaboration.",
        "resources": [
            {"title": "Figma Help Center", "url": "https://help.figma.com/hc/en-us"},
            {"title": "Figma on YouTube", "url": "https://www.youtube.com/@Figma"},
            {"title": "Figma Community", "url": "https://www.figma.com/community"},
        ],
    },
    "User Research": {
        "what_to_learn": "Interviews, usability testing, personas, journey maps and turning findings into design decisions.",
        "why_it_matters": "Research keeps designs grounded in real user needs instead of assumptions.",
        "resources": [
            {"title": "Nielsen Norman Group - Articles", "url": "https://www.nngroup.com/articles/"},
            {"title": "Interaction Design Foundation", "url": "https://www.interaction-design.org/"},
            {"title": "Usability.gov", "url": "https://www.usability.gov/"},
        ],
    },
    "Prototyping": {
        "what_to_learn": "Clickable prototypes, transitions, testing flows with users and iterating on feedback.",
        "why_it_matters": "Prototypes let you validate an experience cheaply before it is built.",
        "resources": [
            {"title": "Figma - Prototyping Help", "url": "https://help.figma.com/hc/en-us"},
            {"title": "Interaction Design Foundation", "url": "https://www.interaction-design.org/"},
            {"title": "Nielsen Norman Group", "url": "https://www.nngroup.com/"},
        ],
    },
    "Visual Design": {
        "what_to_learn": "Typography, colour, spacing, hierarchy, consistency and accessible contrast.",
        "why_it_matters": "Strong visual design makes products clear, trustworthy and pleasant to use.",
        "resources": [
            {"title": "Refactoring UI", "url": "https://www.refactoringui.com/"},
            {"title": "Material Design", "url": "https://m3.material.io/"},
            {"title": "Laws of UX", "url": "https://lawsofux.com/"},
        ],
    },

    # ---------------- Security / Cloud ----------------
    "Networking": {
        "what_to_learn": "OSI and TCP/IP models, IP addressing, DNS, routing, switching, firewalls and common protocols.",
        "why_it_matters": "Understanding how data moves across networks is essential for both security and cloud work.",
        "resources": [
            {"title": "Cisco Networking Academy", "url": "https://www.netacad.com/"},
            {"title": "Professor Messer", "url": "https://www.professormesser.com/"},
            {"title": "Cloudflare Learning Center", "url": "https://www.cloudflare.com/learning/"},
        ],
    },
    "Security Fundamentals": {
        "what_to_learn": "The CIA triad, authentication, encryption, common attacks (phishing, SQL injection, XSS) and OWASP Top 10.",
        "why_it_matters": "Every system is a target, so security basics protect people, data and businesses.",
        "resources": [
            {"title": "OWASP", "url": "https://owasp.org/"},
            {"title": "TryHackMe", "url": "https://tryhackme.com/"},
            {"title": "Cybrary", "url": "https://www.cybrary.it/"},
        ],
    },
    "Risk Assessment": {
        "what_to_learn": "Identifying assets and threats, likelihood vs impact scoring, risk registers and mitigation planning.",
        "why_it_matters": "Risk assessment helps organisations spend security effort on what matters most.",
        "resources": [
            {"title": "NIST Cybersecurity Framework", "url": "https://www.nist.gov/cyberframework"},
            {"title": "OWASP Risk Rating Methodology", "url": "https://owasp.org/www-community/OWASP_Risk_Rating_Methodology"},
            {"title": "SANS Institute", "url": "https://www.sans.org/"},
        ],
    },
    "Linux": {
        "what_to_learn": "The command line, file permissions, processes, package management, shell scripting and SSH.",
        "why_it_matters": "Most servers and cloud systems run on Linux, so command-line comfort is expected.",
        "resources": [
            {"title": "Linux Journey", "url": "https://linuxjourney.com/"},
            {"title": "The Linux Command Line (free book)", "url": "https://linuxcommand.org/tlcl.php"},
            {"title": "OverTheWire - Bandit", "url": "https://overthewire.org/wargames/bandit/"},
        ],
    },
    "Incident Response": {
        "what_to_learn": "Detection, containment, eradication, recovery, log analysis and writing post-incident reports.",
        "why_it_matters": "When something goes wrong, a clear response process limits the damage and speeds recovery.",
        "resources": [
            {"title": "NIST SP 800-61 Incident Handling Guide", "url": "https://csrc.nist.gov/pubs/sp/800/61/r2/final"},
            {"title": "SANS Institute", "url": "https://www.sans.org/"},
            {"title": "TryHackMe", "url": "https://tryhackme.com/"},
        ],
    },
    "AWS": {
        "what_to_learn": "EC2, S3, IAM, VPC basics, databases on AWS, billing awareness and the shared responsibility model.",
        "why_it_matters": "AWS is the largest cloud platform, and cloud skills are in constant demand.",
        "resources": [
            {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws/"},
            {"title": "AWS Documentation", "url": "https://docs.aws.amazon.com/"},
            {"title": "AWS Free Tier", "url": "https://aws.amazon.com/free/"},
        ],
    },
    "Docker": {
        "what_to_learn": "Images and containers, Dockerfiles, volumes, networking and Docker Compose.",
        "why_it_matters": "Containers make apps run the same everywhere, which simplifies deployment.",
        "resources": [
            {"title": "Docker - Get Started", "url": "https://docs.docker.com/get-started/"},
            {"title": "Play with Docker", "url": "https://labs.play-with-docker.com/"},
            {"title": "Docker Curriculum", "url": "https://docker-curriculum.com/"},
        ],
    },
    "Kubernetes": {
        "what_to_learn": "Pods, deployments, services, scaling, config maps and basic troubleshooting with kubectl.",
        "why_it_matters": "Kubernetes runs and scales containerised applications in most production environments.",
        "resources": [
            {"title": "Kubernetes Basics Tutorial", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"},
            {"title": "Kubernetes Tutorials", "url": "https://kubernetes.io/docs/tutorials/"},
            {"title": "KodeKloud", "url": "https://kodekloud.com/"},
        ],
    },
}


def get_skill_content(skill_name):
    """Returns a dict with what_to_learn, why_it_matters and resources for a skill.
    Falls back to a generic version when the skill is not in the bank."""
    content = SKILL_CONTENT.get(skill_name)
    if content:
        return {
            "what_to_learn": content["what_to_learn"],
            "why_it_matters": content["why_it_matters"],
            "resources": content["resources"],
        }

    return {
        "what_to_learn": (
            f"Core concepts and terminology of {skill_name}, the most common tools and "
            f"techniques, and how to apply them in a small hands-on project."
        ),
        "why_it_matters": (
            f"{skill_name} is one of the skills required for your recommended career, "
            f"so building it closes a gap between where you are and where you want to be."
        ),
        "resources": [
            {"title": f"{skill_name} - Wikipedia overview", "url": "https://en.wikipedia.org/wiki/" + skill_name.replace(" ", "_")},
            {"title": f"{skill_name} on freeCodeCamp", "url": "https://www.freecodecamp.org/news/search/?query=" + skill_name.replace(" ", "%20")},
            {"title": f"{skill_name} on YouTube", "url": "https://www.youtube.com/results?search_query=" + skill_name.replace(" ", "+") + "+tutorial"},
        ],
    }