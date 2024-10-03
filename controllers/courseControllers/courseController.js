import Course from "../../models/courseModels/CourseModel.js";

// Validate course data
const validateCourseData = ({ name, courseName, courseCode, duration, sessionDuration, year, startDate, endDate, subjects }) => {
    if (!name || !courseName || !courseCode || !duration || !sessionDuration || !year || !startDate || !endDate || !Array.isArray(subjects) || subjects.length === 0) {
        return 'All fields are required. Please ensure that name, courseName, courseCode, duration, sessionDuration, year, startDate, endDate, and subjects are provided.';
    }

    if (typeof duration !== 'number' || duration <= 0) {
        return 'Duration must be a valid number greater than 0.';
    }

    if (typeof sessionDuration !== 'number' || sessionDuration <= 0) {
        return 'Session duration must be a valid number greater than 0.';
    }

    if (!Date.parse(startDate) || !Date.parse(endDate)) {
        return 'Invalid date data. Please provide valid startDate and endDate.';
    }

    for (let subject of subjects) {
        if (!subject.subjectName || !subject.subjectCode) {
            return 'Each subject must have a valid subjectName and subjectCode.';
        }
    }

    return null;
};

// Save or update course data
const saveOrUpdateCourse = async (courseData, course) => {
    course.name = courseData.name;
    course.courseName = courseData.courseName;
    course.courseCode = courseData.courseCode;
    course.duration = courseData.duration;
    course.subjects = courseData.subjects;
    course.sessionDuration = courseData.sessionDuration;
    course.year = courseData.year;
    course.startDate = courseData.startDate;
    course.endDate = courseData.endDate;
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
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error occurred while creating the course.' });
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
        res.status(200).json(updatedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error occurred while updating the course.' });
    }
};

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error occurred while retrieving courses.' });
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
        return res.status(500).json({ error: 'Server error occurred while retrieving the course.' });
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
        return res.status(500).json({ error: 'Server error occurred while removing the course.' });
    }
};

export { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse };
