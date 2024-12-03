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
    try {
        let isUpdated = false;

        // Only update the fields that are actually changed
        if (course.className !== courseData.className) {
            course.className = courseData.className;
            isUpdated = true;
        }
        if (course.classCode !== courseData.classCode) {
            course.classCode = courseData.classCode;
            isUpdated = true;
        }
        if (course.duration !== courseData.duration) {
            course.duration = courseData.duration;
            isUpdated = true;
        }
        if (course.session !== courseData.session) {
            course.session = courseData.session;
            isUpdated = true;
        }
        if (course.year !== courseData.year) {
            course.year = courseData.year;
            isUpdated = true;
        }
        if (course.startDate !== courseData.startDate) {
            course.startDate = courseData.startDate;
            isUpdated = true;
        }
        if (course.endDate !== courseData.endDate) {
            course.endDate = courseData.endDate;
            isUpdated = true;
        }
        if (course.isActive !== courseData.isActive) {
            course.isActive = courseData.isActive;
            isUpdated = true;
        }

        // Update the updatedAt field only if the course has been modified
        if (isUpdated) {
            course.updatedAt = Date.now();
        }

        return await course.save();
    } catch (err) {
        console.error(err);
        throw new Error('An error occurred while saving or updating the course.');
    }
};

// Create a new course
const createCourse = async (req, res) => {
    const validationError = validateCourseData(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    // Check if classCode already exists
    const existingCourse = await Course.findOne({ classCode: req.body.classCode });
    if (existingCourse) {
        return res.status(400).json({ error: 'Class code already exists.' });
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
    const courseId = req.params.id;
    const courseData = req.body;

    // Validate course data
    const validationError = validateCourseData(courseData);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        // Update or save the course
        const updatedCourse = await saveOrUpdateCourse(courseData, course);
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
