import Course from "../../models/courseModels/CourseModel.js";

// Reusable validation function for course data
const validateCourseData = ({ name, code, duration, session, semesters }) => {
    // Check if all fields are provided
    if (!name || !code || !duration || !session || !session.sessionName || !session.startDate || !session.endDate || !semesters) {
        return 'All fields are required. Please ensure that name, code, duration, session, and semesters are provided.';
    }

    // Check if duration is a valid number
    if (typeof duration !== 'number' || duration <= 0) {
        return 'Duration must be a valid number greater than 0.';
    }

    // Validate session fields
    if (!Date.parse(session.startDate) || !Date.parse(session.endDate)) {
        return 'Invalid session dates. Please provide valid startDate and endDate.';
    }

    // Check if semesters is an array and has valid structure
    if (!Array.isArray(semesters) || semesters.length === 0) {
        return 'Semesters should be a non-empty array.';
    }

    // Ensure each semester contains subjects and valid semesterNumber
    for (let semester of semesters) {
        if (!semester.semesterNumber || !Array.isArray(semester.subjects) || semester.subjects.length === 0) {
            return `Each semester must have a valid semesterNumber and at least one subject.`;
        }

        // Validate each subject in the semester
        for (let subject of semester.subjects) {
            if (!subject.name || !subject.code) {
                return 'Each subject must have a valid name and code.';
            }
        }
    }

    // If everything is valid, return null (no error)
    return null;
};
// Create or update course helper function
const saveOrUpdateCourse = async (courseData, course) => {
    const { name, code, duration, session, semesters } = courseData;

    // Assign values to the course object
    course.name = name;
    course.code = code;
    course.duration = duration;
    course.session = session;
    course.semesters = semesters;
    course.updatedAt = Date.now();  // Update the updatedAt timestamp

    // Save the course to the database
    return await course.save();
};

// Create course controller
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

// Update course controller
const updateCourse = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the course by ID
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const validationError = validateCourseData(req.body);

        // If there's a validation error, return it
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // Save updated course
        const updatedCourse = await saveOrUpdateCourse(req.body, course);
        res.status(200).json(updatedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error occurred while updating the course.' });
    }
};

// Get all courses controller
const getAllCourses = async (req, res) => {
    try {
        // Fetch all courses from the database
        const courses = await Course.find();

        // Return the list of courses
        return res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error occurred while retrieving courses.' });
    }
};


// Get course by ID controller
const getCourseById = async (req, res) => {
    const { id } = req.params;  // Extract course ID from request parameters

    try {
        // Fetch the course by ID from the database
        const course = await Course.findById(id);

        // Check if the course exists
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        // Return the found course
        return res.status(200).json(course);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error occurred while retrieving the course.' });
    }
};


const removeCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id); // Delete the course by ID

        // Check if the course was found and deleted
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }

        // Return a success message
        return res.status(200).json({ message: 'Course successfully removed.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error occurred while removing the course.' });
    }
};



export { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse };
