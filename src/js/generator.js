$(function() {

    function copyToClipboard(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
    $( 'button.copy' ).on('click', function(){
        copyToClipboard($('div.apache-config pre').html() );
    });

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
                    response = response.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\n\s*\n/g, '\n');
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
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function render(e){
        if(typeof e !== 'undefined'){
            e.preventDefault();
        }

        var name = 'apache-config'
            context,
            template,
            form,
            config;

        template = Handlebars.getTemplate( name );

        form = template['form'];
        config = template['config'];



        context = $('form.apache-config').serializeArray().reduce(function(obj, item) {
                                                obj[item.name] = item.value;
                                                return obj;
                                            }, {});

        sanatize(context);
        console.log('context', context);


        // html = form(context);
        // $('form.apache-config').html(html);

        html = config(context);
        $('div.apache-config pre').html(html);
    }

    function sanatize(context){
        console.log('sanatize', context);
        if(typeof context.serverName !== 'undefined'){
            context.virtualHost = context.virtualHost || context.serverName;
        }

    }

    $('form.apache-config').on( 'change', render);
    $('form.apache-config').on('click', 'button.refresh', render);

    $('form.apache-config').on('change', '#virtualHost-tgl', function(e){
        console.log($(this).siblings('input[name="virtualHost"]'));
        $(this).siblings('input[name="virtualHost"]').first().toggle().toggleDisabled();
    });

    $('form.apache-config').on('click', '#ssl-btn', function(e){
        $('.ssl-btn').toggle();

        if( $('#ssl-btn').hasClass('active') ){
            $('#ssl-btn').removeClass('active');
        }else{
            $('#ssl-btn').addClass('active');
        }
    });

    var name = 'apache-config',
        context,
        template,
        form,
        config;

    template = Handlebars.getTemplate( name );

    form = template['form'];
    config = template['config'];


    html = form( getUrlVars() );
    $('form.apache-config').html(html);

    render();

});
