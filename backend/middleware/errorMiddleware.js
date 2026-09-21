const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // =====================================================
    // MONGOOSE INVALID OBJECT ID
    // =====================================================

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    // =====================================================
    // MONGOOSE VALIDATION ERROR
    // =====================================================

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors)
            .map((error) => error.message);

        return res.status(400).json({
            success: false,
            message: messages.join(", ")
        });
    }

    // =====================================================
    // DUPLICATE KEY ERROR
    // =====================================================

    if (err.code === 11000) {
        const field = Object.keys(
            err.keyPattern || {}
        )[0];

        return res.status(409).json({
            success: false,
            message: field
                ? `${field} already exists`
                : "Duplicate data already exists"
        });
    }

    // =====================================================
    // DEFAULT SERVER ERROR
    // =====================================================

    return res.status(500).json({
        success: false,
        message: "Something went wrong"
    });
};

module.exports = errorHandler;