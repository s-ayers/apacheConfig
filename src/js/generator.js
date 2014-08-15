(function($) {

    function copyToClipboard(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }

    Handlebars.getTemplate = function(name) {
        console.log(Handlebars.templates);
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
         //       debugger;
                var template;
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {
                        'form':{},
                        'config':{}
                    };
                }
                Handlebars.templates[type][name] = '';

                if(type === 'config'){
                console.log('before:', response);
                    response = response.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\s*\n/g, '\n').replace(/\n\s*\n/g, '\n').replace(/\n\n/g, '\n');
                console.log('after', response);
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
            console.log(e);
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
        console.log('sanatize', context);
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

        $( 'button.copy' ).on('click', function(){
            copyToClipboard($('div.apache-config pre').html() );
        });

        $('#form-tabs').on('click', 'a', function (e) {
              e.preventDefault();
              $(this).tab('show');
              console.log(e,this);
        });

        $('form.apache-config').
            on('click', 'button.refresh', render).
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
