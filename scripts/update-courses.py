import json
import re

# Read the file
with open('lib/courses-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the interface and the array separately
interface_match = re.search(r'(export interface Course \{[^}]+\})', content, re.DOTALL)
array_start = content.find('export const courses: Course[] = ')

if not array_start:
    print("Could not find courses array")
    exit(1)

# Extract just the array part (from '[' to the final '];')
array_content = content[array_start:]
json_start = array_content.find('[')
json_end = array_content.rfind('];')
json_str = array_content[json_start:json_end+1]

# Parse the JSON
courses = json.loads(json_str)

# Add country and region to each course
for course in courses:
    course['country'] = 'Thailand'
    course['region'] = 'Pattaya'
    # Reorder keys to put country and region first
    reordered = {'country': course.pop('country'), 'region': course.pop('region')}
    reordered.update(course)
    course.clear()
    course.update(reordered)

# Write back
interface_part = content[:array_start]
new_array = 'export const courses: Course[] = ' + json.dumps(courses, ensure_ascii=False, indent=2) + ';\n'
new_content = interface_part + new_array

with open('lib/courses-data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Updated {len(courses)} courses with country and region fields")
