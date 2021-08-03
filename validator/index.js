exports.userRegisterValidator = (req, res, next) => {

    //title
    //verificando se o o nome não está vazio e seje entre 4 a 10 caracteres
    req.check('firstname', 'Name is required').notEmpty()
    //verificiando se o texto esta entre 4 a 150 caracteres
    req.check('firstname', 'Name must be between 3 to 10 characters').isLength({
        min: 3,
        // max: 10
    })
    req.check('lastname', 'Lastname is required').notEmpty()
    //verificiando se o texto esta entre 4 a 150 caracteres
    req.check('lastname', 'Name must be between 3 to 10 characters').isLength({
        min: 3,
        // max: 10
    })
    //verificando se o o username não está vazio e seje entre 4 a 10 caracteres
    req.check('username', 'Username  is required').notEmpty()
    //verificiando se o texto esta entre 4 a 150 caracteres
    req.check('username', 'Username must be between 3 to 13 characters').isLength({
        min: 3,
        // max: 13
    })
    //email
    //verificando se o email não está vazio, valido e normalizadp
    //verificiando se o texto esta entre 4 a 32 caracteres
    req.check('email', 'Email must be between 4 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage("Email must contain @")
        .isLength({
            min: 3,
            max: 32
        });

    //body
    //verificando se o email não está vazio, valido e normalizadp
    //verificiando se a senha possui pelo menos 6 caracteres
    req.check('password', 'Password is required')
    req.check('password').isLength({ min: 6 })
        .withMessage("Password must contain at least 6 characters")
        .matches(/(?=.*[A-Z])/)
        .withMessage("Password must contain 1 uppercase letter")
        .matches(/(?=.*[a-z])/)
        .withMessage("Password must contain 1 lowercase letter")
        .matches(/\d/) //senha com pelo menos um numero
        .withMessage("Password must contain a number")
        .matches(/(?=.*[}{,.^?~=+\-_\/*\-+.\| !@#%¨$&()""''ºª`´;:><])/)
        .withMessage("Password must contain a special character")


    //checando por erros
    const errors = req.validationErrors();
    //busca todos os erros
    //se tiver erro mostre o primeiro erro que aparecer
    if (errors) {
        //pegando o primeiro erro
        const firstError = errors.map((error) => error.msg)[0]
        //retornando o primeiro rrro
        return res.status(400).json({ error: firstError })
    }
    //indo para o proximo middleware
    next();

}