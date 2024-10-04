import Course from "../../models/classModel/classModel.js";

// Validate course data
const validateCourseData = (courseData) => {
    const { className, classCode, duration, session, year } = courseData;

    if (!className || !classCode || !duration || !session || !year) {
        return 'All fields are required';
    }
    return null;
};

// Save or update course data
const saveOrUpdateCourse = async (courseData, course) => {
    Object.assign(course, {
        className: courseData.className,
        classCode: courseData.classCode,
        duration: courseData.duration,
        session: courseData.session,
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
        const savedCourse = await newCourse.save();
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
