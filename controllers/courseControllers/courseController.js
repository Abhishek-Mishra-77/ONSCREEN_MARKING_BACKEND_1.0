import Course from "../../models/courseModels/CourseModel.js";

const validateCourseData = ({ name, code, duration, session, courses }) => {
    if (!name || !code || !duration || !session || !session.sessionName || !session.startDate || !session.endDate || !courses) {
        return 'All fields are required. Please ensure that name, code, duration, session, and courses are provided.';
    }

    if (typeof duration !== 'number' || duration <= 0) {
        return 'Duration must be a valid number greater than 0.';
    }

    if (!Date.parse(session.startDate) || !Date.parse(session.endDate)) {
        return 'Invalid session dates. Please provide valid startDate and endDate.';
    }

    if (!Array.isArray(courses) || courses.length === 0) {
        return 'Courses should be a non-empty array.';
    }

    for (let subject of courses) {
        if (!subject.name || !subject.code) {
            return `Each course must have a valid name and code.`;
        }
    }
    return null;
};

const saveOrUpdateCourse = async (courseData, course) => {
    const { name, code, duration, session, courses } = courseData;

    course.name = name;
    course.code = code;
    course.duration = duration;
    course.session = session;
    course.courses = courses;
    course.updatedAt = Date.now();
    return await course.save();
};

const createCourse = async (req, res) => {
    const validationError = validateCourseData(req.body);

    // If there's a validation error, return it
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    // Prepare new course object
    const newCourse = new Course(req.body);

    try {
        // Save the course
        const savedCourse = await saveOrUpdateCourse(req.body, newCourse);
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error occurred while creating the course.' });
    }
};


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

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();

        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error occurred while retrieving courses.' });
    }
};


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
