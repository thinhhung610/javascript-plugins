# The JavaScript plugin - validation

## Using
1. Add the data tag 'data-validation="true"' to the form what you want to validate, and add the tag 'novalidate' for removing the default validation from html5.

2. Add the rules and message rules
- data-rules="[rules: required, number, email, url]"
- data-messages-[rule_name]="[the message shows when failed the validation]"
- some html5 rules like: required, minlength, maxlength

## Functionalities
- init()
- validate()
- destroy()