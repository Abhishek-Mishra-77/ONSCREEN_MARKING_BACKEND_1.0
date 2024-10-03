import Course from "../../models/courseModels/CourseModel.js";

const validateCourseData = (courseData) => {
    console.log("Received course data:", courseData);
    const { class: courseClass, courseName, courseCode, duration, session, year, subjects } = courseData;

    if (!courseClass?.trim() || !courseName?.trim() || !courseCode?.trim() ||
        typeof duration !== 'number' || duration <= 0 ||
        typeof session !== 'number' || session <= 0 ||
        !year?.trim() || !Array.isArray(subjects) || subjects.length === 0) {
        return 'All fields except startDate, endDate, and isActive are required. Please ensure that class, courseName, courseCode, duration, session, year, and subjects are provided.';
    }

    for (let subject of subjects) {
        if (!subject.subjectName?.trim() || !subject.subjectCode?.trim()) {
            return 'Each subject must have a valid subjectName and subjectCode.';
        }
    }

    return null;
};

// Save or update course data
const saveOrUpdateCourse = async (courseData, course) => {
    Object.assign(course, {
        class: courseData.class,
        courseName: courseData.courseName,
        courseCode: courseData.courseCode,
        duration: courseData.duration,
        session: courseData.session,
        subjects: courseData.subjects,
        year: courseData.year,
        startDate: courseData.startDate || null,
        endDate: courseData.endDate || null,
        isActive: courseData.isActive !== undefined ? courseData.isActive : true,
    });
    return await course.save();
};

// Create a new course
const createCourse = async (req, res) => {
    const validationError = validateCourseData(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const newCourse = new Course(req.body);

    try {
        const savedCourse = await saveOrUpdateCourse(req.body, newCourse);
        return res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while creating the course.' });
    }
};

// Update an existing course
const updateCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const validationError = validateCourseData(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const updatedCourse = await saveOrUpdateCourse(req.body, course);
        return res.status(200).json(updatedCourse);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while updating the course.' });
    }
};

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while retrieving courses.' });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while retrieving the course.' });
    }
};

// Remove a course
const removeCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        return res.status(200).json({ message: 'Course successfully removed.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while removing the course.' });
    }
};

export { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse };
