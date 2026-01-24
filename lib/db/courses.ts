import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, getCountFromServer } from "firebase/firestore";
import { Course } from "@/lib/courses-data";

const COLLECTION_NAME = "golf-courses";

export async function getCourses(): Promise<Course[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
        courses.push(doc.data() as Course);
    });
    return courses;
}

export async function getCourse(id: string): Promise<Course | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Course;
    } else {
        return null;
    }
}

export async function createCourse(course: Course): Promise<void> {
    await setDoc(doc(db, COLLECTION_NAME, course.id), course);
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

export async function getCoursesCount(): Promise<number> {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}
