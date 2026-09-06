QUESTION_BANK = {
    "SQL": [
        {"question": "Which SQL command retrieves data from a table?", "options": ["GET", "SELECT", "FETCH", "READ"], "correct_index": 1},
        {"question": "Which clause filters rows in SQL?", "options": ["ORDER BY", "GROUP BY", "WHERE", "FILTER"], "correct_index": 2},
        {"question": "Which keyword sorts query results?", "options": ["SORT", "ORDER BY", "ARRANGE", "GROUP"], "correct_index": 1},
        {"question": "Which function returns the number of rows?", "options": ["TOTAL()", "NUMBER()", "COUNT()", "SUM()"], "correct_index": 2},
        {"question": "Which JOIN returns only matching rows from both tables?", "options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], "correct_index": 2},
        {"question": "Which clause groups rows sharing a value into summary rows?", "options": ["GROUP BY", "ORDER BY", "HAVING", "WHERE"], "correct_index": 0},
        {"question": "Which command removes a table entirely?", "options": ["DELETE", "REMOVE", "DROP", "TRUNCATE"], "correct_index": 2},
        {"question": "Which clause is used with GROUP BY to filter aggregated results?", "options": ["WHERE", "HAVING", "FILTER", "ON"], "correct_index": 1},
    ],
    "Python": [
        {"question": "Which keyword defines a function in Python?", "options": ["func", "def", "function", "lambda"], "correct_index": 1},
        {"question": "Which data type is immutable in Python?", "options": ["list", "dict", "tuple", "set"], "correct_index": 2},
        {"question": "What does len([1,2,3]) return?", "options": ["2", "3", "4", "Error"], "correct_index": 1},
        {"question": "Which symbol starts a comment in Python?", "options": ["//", "#", "--", "/*"], "correct_index": 1},
        {"question": "Which method adds an item to the end of a list?", "options": ["add()", "append()", "push()", "insert()"], "correct_index": 1},
        {"question": "Which keyword is used to handle exceptions?", "options": ["catch", "except", "error", "handle"], "correct_index": 1},
        {"question": "What does 'pip' stand for/manage?", "options": ["Package installer for Python", "Python interpreter", "Print in Python", "None of these"], "correct_index": 0},
        {"question": "Which loop is used to iterate over a sequence?", "options": ["while", "for", "loop", "repeat"], "correct_index": 1},
    ],
    "Statistics": [
        {"question": "Which measure represents the middle value of a dataset?", "options": ["Mean", "Median", "Mode", "Range"], "correct_index": 1},
        {"question": "Which value appears most frequently in a dataset?", "options": ["Mean", "Median", "Mode", "Variance"], "correct_index": 2},
        {"question": "Standard deviation measures what?", "options": ["Central tendency", "Data spread", "Data frequency", "Sample size"], "correct_index": 1},
        {"question": "A p-value below 0.05 typically indicates what?", "options": ["No significance", "Statistical significance", "A data error", "Perfect correlation"], "correct_index": 1},
        {"question": "Which chart is best for showing distribution of a single variable?", "options": ["Pie chart", "Histogram", "Line chart", "Scatter plot"], "correct_index": 1},
        {"question": "Correlation of 1 means what?", "options": ["No relationship", "Perfect negative relationship", "Perfect positive relationship", "Random relationship"], "correct_index": 2},
    ],
    "Communication": [
        {"question": "Which is a key element of active listening?", "options": ["Interrupting often", "Paraphrasing what you heard", "Multitasking", "Giving quick advice"], "correct_index": 1},
        {"question": "What's the best way to give constructive feedback?", "options": ["Focus only on the negative", "Be specific and behavior-focused", "Compare to others", "Avoid it entirely"], "correct_index": 1},
        {"question": "In a presentation, what helps audience retention most?", "options": ["Reading slides word for word", "A clear structure with key takeaways", "Using as much text as possible", "Speaking very fast"], "correct_index": 1},
        {"question": "Which communication style focuses on directness and respect?", "options": ["Passive", "Aggressive", "Assertive", "Passive-aggressive"], "correct_index": 2},
    ],
    "Machine Learning": [
        {"question": "What does 'overfitting' mean in ML?", "options": ["Model performs well on new data", "Model memorizes training data poorly generalizing", "Model trains too fast", "Model has too few parameters"], "correct_index": 1},
        {"question": "Which is a supervised learning task?", "options": ["Clustering", "Classification", "Dimensionality reduction", "Anomaly detection"], "correct_index": 1},
        {"question": "What is a common technique to prevent overfitting?", "options": ["Removing all data", "Regularization", "Increasing model complexity", "Ignoring validation data"], "correct_index": 1},
        {"question": "Which metric is commonly used for classification accuracy?", "options": ["Mean Squared Error", "R-squared", "F1 Score", "Standard Deviation"], "correct_index": 2},
    ],
}

GENERIC_TEMPLATES = [
    {"question": "Which of these best describes a core concept in {skill}?", "options": ["Fundamentals and best practices", "Unrelated general knowledge", "A completely different field", "None of the above"], "correct_index": 0},
    {"question": "What is typically the first step when learning {skill}?", "options": ["Understanding the basics and terminology", "Skipping to advanced topics", "Ignoring documentation", "Avoiding practice"], "correct_index": 0},
    {"question": "Which practice generally improves proficiency in {skill}?", "options": ["Consistent hands-on practice", "Avoiding real projects", "Memorizing without applying", "Working in isolation only"], "correct_index": 0},
    {"question": "Why is {skill} considered valuable in this career path?", "options": ["It directly supports key job responsibilities", "It has no real application", "It's only used occasionally", "It's outdated"], "correct_index": 0},
    {"question": "What's a good way to validate your understanding of {skill}?", "options": ["Applying it to a real project or case study", "Never testing your knowledge", "Guessing", "Avoiding feedback"], "correct_index": 0},
]