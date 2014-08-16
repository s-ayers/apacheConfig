(function($) {

    Handlebars.registerHelper('debug', function(optionalValue) {
      console.log('Current Context');
      console.log('====================');
      console.log(this);

      if (optionalValue) {
        console.log('Value');
        console.log('====================');
        console.log(optionalValue);
      }
    });

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

    function getTemplateHelper(path){

        var compiled;

        $.ajax({
            url : 'templates/' + path + '.handlebars',
            datatype: 'text/javascript',
            success : function(response, status, jqXHR) {

                compiled = Handlebars.compile(response);

            },
            async : false
        });

        return compiled;
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

        var name = 'apache-config'
            context = form2js('apache'),
            form = $('form.apache-config'),
            template = Handlebars.templates.apache.site;

        sanatize(context);

        console.log(context);
        html = template(context);
        console.log(html);
        // html = html.replace(/\n\n\n/g, '\n\n');
        $('div.apache-config pre > code').html(html);
    }

    function sanatize(context){

        if (typeof context.site !== 'undefined'){
            context.site.virtualHost = context.site.virtualHost || context.site.serverName;
        }

        if (typeof context.mod !== 'undefined' && typeof context.mod.ssl !== 'undefined' && context.mod.ssl.enabled !== ''){
            $('#mod-ssl-wrapper').show();
        }else{
            $('#mod-ssl-wrapper').hide();
        }

    }

    $(document).ready(function(){

        var name = 'apache-config',
            context,
            template,
            form,
            config;

        Handlebars.templates = {
            apache : {
                form : null,
                site : null
            }
        };

        Handlebars.registerHelper('if_eq', function(a, b, opts) {
            if(a == b) // Or === depending on your needs
                return opts.fn(this);
            else
                return opts.inverse(this);
        });

        Handlebars.templates.apache.site = getTemplateHelper( 'apache/vanilla/2.2/site' );
        Handlebars.templates.apache.form = getTemplateHelper( 'apache/form' );




        $.ajax({
            url : 'templates/' + 'apache/vanilla/2.2/default' + '.handlebars',
            datatype: 'text/javascript',
            success : function(response, status, jqXHR) {
                Handlebars.registerPartial("default", response);
            },
            async : false
        });

        $.ajax({
            url : 'templates/' + 'apache/snippets/forceSsl' + '.handlebars',
            datatype: 'text/javascript',
            success : function(response, status, jqXHR) {
                Handlebars.registerPartial("forceSsl", response);
            },
            async : false
        });

        $('form.apache-config').
            on('change', render).
            on('keyup', render);

        $('form.apache-config').on('change', '#virtualHost-tgl', function(e){
            $(this).siblings('input[name="virtualHost"]')
                    .first()
                    .toggle()
                    .toggleDisabled();
        });



        form = Handlebars.templates['apache']['form'];

        console.log(form);

        html = form({
            site : { serverName : 'config.binaryalchemist.org',
                     documentRoot : '/var/www/config.binaryalchemist.org/www/',
                     serverAlias : 'www.config.binaryalchemist.org'
                    },
            mode : { cert : '/etc/apache2/ssl/binaryalchemist.cert',
                     key : '/etc/apache2/ssl/binaryalchemist.key'
                    }

        });
        $('form.apache-config').html(html);

        render();
    });


}(jQuery));
