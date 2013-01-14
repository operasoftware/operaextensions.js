:: Consult the README file @ ./resources/compiler/jsdocsgen/README
::
:: You need to execute 'sudo cpan HTML::Template' before running this script!
::
perl ./resources/compiler/jsdocsgen/jsdoc.pl ./resources/refSrc/backgroundProcess/ --project-name "Opera Extensions - Background Process" --logo ./resources/images/opera.png --no-source -directory ./background/

perl ./resources/compiler/jsdocsgen/jsdoc.pl ./resources/refSrc/userJS/ --project-name "Opera Extensions - Injected Scripts" --logo ./resources/images/opera.png --no-source -directory ./injectedscripts/

perl ./resources/compiler/jsdocsgen/jsdoc.pl ./resources/refSrc/popup/ --project-name "Opera Extensions - Popup" --logo ./resources/images/opera.png --no-source -directory ./popup/
