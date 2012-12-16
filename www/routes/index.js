

module.exports = {
    index: function(req, res, next){
        var renderer = require('../util/pageBuilder.js')();
        //res.render('index', { title: 'Express', sidebar_counter: 'Some content' });
        var view = {
            title: 'Express',
            newsletter: true,
            /*sidebar_counter:    ['txtNumAvailable', 12],*/
            page_title: 'txtPersonalAutographs',
            page_title_description: 'txtPersonalAutographDescription',
            placeholder_search: {text: 'txtSearch', filter: String.prototype.toLowerCase},
            search_music: {text: 'txtMusic', filter: String.prototype.toLowerCase},
            next_step: 'txtNextStep',
            currency: '€',
            txt_video: 'txtVideo',
            txt_audio: 'txtAudio',
            more_information: 'txtMoreInformation',
            txt_information: 'txtInformation',
            stars: [
                {id: 19029932, name: 'Kizer', sale: true, price: '8,00', video: true, audio: true, image: '/images/imgs/starts-small/star-small-6.jpg'},
                {id: 19223422, name: 'Mizer', sale: false, price: '20,00', video: false, audio: true, image: '/images/imgs/starts-small/star-small-4.jpg'},
                {id: 19092032, name: 'Pizza', sale: false, price: '15,00', video: true, audio: false, image: '/images/imgs/starts-small/star-small-1.jpg'}
            ],
            txt_found: {text: 'txtFound', filter: String.prototype.toUpperCase}
        };
        
        // Get the list of stars
        require('../controllers/stars.js').getStars({limit: 10}, function (err, stars) {
            if(err) {
                // Something bad
                res.send('Server error', 500);
            }
            
            view.stars = stars;
            view.found = stars.length;
            
            // Add images to the objects
            stars.forEach(function (star) {
                star.image = '/images/stars/thumbs/' + star.starId + '.jpg'; // TODO: Rewrite this function to use a more standard/dynamic image URL generator
            });
            
            renderer.render({page: 'main/index', vars: view}, req, res, next);
        });
    },
    
    login: function (req, res, next) {
        var post = req.body;
        var auth = require('../controllers/auth.js');
        auth.login(post.username, post.password, function (err, details) {
            if(err) {
                return res.json({error: err.message || err});
            }
            
            var session = require('../controllers/session.js');
            session.createSession(details, {ip: req.socket.remoteAddress, userAgent: req.headers['user-agent']}, function (err, sessionId) {
                if(err) {
                    return res.json({error: err.message || err});
                }
                
                // Session created... send session cookies
                res.cookie('sid', sessionId);
                
                // Respond
                res.json({
                    success: true,
                    token: sessionId
                });
            });
        });
    },
    
    logout: function (req, res, next) {
        req.logout(function (err) {
            if(err) {
                res.send('Could not log out', 500);
                res.end();
            } else {
                res.redirect('/');
            }
        });
    }
};
