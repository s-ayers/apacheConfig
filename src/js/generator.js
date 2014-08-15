(function($) {

    Handlebars.getTemplate = function(name) {
        if (Handlebars.templates === undefined || Handlebars.templates['config'][name] === undefined || Handlebars.templates['form'][name] === undefined) {
            getTemplateHelper(name, 'config');
            getTemplateHelper(name, 'form');
        }
        return {
            'config' : Handlebars.templates['config'][name],
            'form' : Handlebars.templates['form'][name]
        };
    };

    function getTemplateHelper(name, type){

        $.ajax({
            url : 'templates/' + type + '/' + name + '.handlebars',
            datatype: 'text/javascript',
            success : function(response, status, jqXHR) {
                var template;
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {
                        'form':{},
                        'config':{}
                    };
                }
                Handlebars.templates[type][name] = '';

                if(type === 'config'){
                    response = response.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\s*\n/g, '\n').replace(/\n\s*\n/g, '\n').replace(/\n\n/g, '\n');
                }

                template = Handlebars.compile(response);
                Handlebars.templates[type][name] = template;

            },
            async : false
        });
    }

    var name = 'apache-config',
        template,
        form,
        config,
        html,
        context;

    function getUrlVars(){
        var vars = [], hash, hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function render(e){
        if(typeof e !== 'undefined' && e.originalEvent.type !== 'keyup' ){
            e.preventDefault();
        }

        var name = 'apache-config'
            context,
            template,
            form = $('form.apache-config'),
            config;

        template = Handlebars.getTemplate( name );

        config = template['config'];

        context = form.serializeArray().reduce(function(obj, item) {
                                                obj[item.name] = item.value;
                                                return obj;
                                            }, {});

        sanatize(context);

        html = config(context);
        html = html.replace(/\n\n\n/g, '\n\n');
        $('div.apache-config pre').html(html);
    }

    function sanatize(context){
        if(typeof context.serverName !== 'undefined'){
            context.virtualHost = context.virtualHost || context.serverName;
        }

    }

    $(document).ready(function(){

        var name = 'apache-config',
            context,
            template,
            form,
            config;


        $('form.apache-config').
            on('change', render).
            on('keyup', render);

        $('form.apache-config').on('change', '#virtualHost-tgl', function(e){
            $(this).siblings('input[name="virtualHost"]')
                    .first()
                    .toggle()
                    .toggleDisabled();
        });

        template = Handlebars.getTemplate( name );

        form = template['form'];
        config = template['config'];


        html = form( getUrlVars() );
        $('form.apache-config').html(html);

        render();
    });


}(jQuery));
