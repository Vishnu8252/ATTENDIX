const authorizeRole = (role) => {
    return (req, res, next) => {

        // =====================================================
        // AUTHENTICATION CHECK
        // =====================================================

        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // =====================================================
        // AUTHORIZED
        // =====================================================

        next();
    };
};

module.exports = authorizeRole;