'use strict';

module.exports = function (router) {
    router.use(function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN')
            return next(err);

        req.flash("error", "Falha na verificação de TOKEN!")
        res.redirect("/login");
    });
}