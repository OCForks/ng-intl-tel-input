angular.module('ngIntlTelInput')
  .directive('ngIntlTelInput', ['ngIntlTelInput', '$log', '$window', '$parse',
    function (ngIntlTelInput, $log, $window, $parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ctrl) {
          // Warning for bad directive usage.
          if ((!!attr.type && (attr.type !== 'text' && attr.type !== 'tel')) || elm[0].tagName !== 'INPUT') {
            $log.warn('ng-intl-tel-input can only be applied to a *text* or *tel* input');
            return;
          }
          // Override default country.
          if (attr.initialCountry) {
            ngIntlTelInput.set({initialCountry: attr.initialCountry});
          }
          // Initialize.
          ngIntlTelInput.init(elm);
          // Set Selected Country Data.
          function setSelectedCountryData(model) {
            var getter = $parse(model);
            var setter = getter.assign;
            setter(scope, elm.intlTelInput('getSelectedCountryData'));
          }
          // Handle Country Changes.
          function handleCountryChange() {
            setSelectedCountryData(attr.selectedCountry);
          }
          // Country Change cleanup.
          function cleanUp() {
            angular.element($window).off('countrychange', handleCountryChange);
          }
          // Selected Country Data.
          if (attr.selectedCountry) {
            setSelectedCountryData(attr.selectedCountry);
            angular.element($window).on('countrychange', handleCountryChange);
            scope.$on('$destroy', cleanUp);
          }

          // Options
          if (attr.options) {
            scope.options = attr.options;
          }
          // Validation.
          ctrl.$validators.ngIntlTelInput = function (value) {
            // if phone number is deleted / empty do not run phone number validation
            if (value || elm[0].value.length > 0) {
                return elm.intlTelInput('isValidNumber');
            } else {
                return true;
            }
          };
          // Set model value to valid, formatted version.
          ctrl.$parsers.push(function (value) {

            if (!scope.options) {
              return elm.intlTelInput('getNumber');
            }

            var options = scope.options.split(",");
            var model = {};
            if (options.indexOf('phone')) {
              model.phone = elm.intlTelInput('getNumber');
            }
            if (options.indexOf('country')) {
              var countryData = elm.intlTelInput('getSelectedCountryData');
              model.country = (countryData && countryData.dialCode) ? countryData.dialCode : '1';
            }

            return model;
          });
          // Set input value to model value and trigger evaluation.
          ctrl.$formatters.push(function (value) {
            if (value) {
              if (typeof value !== 'string')  {

                elm.intlTelInput('setNumber', (value.phone) ? value.phone : '');
                if (value.country) {
                  elm.intlTelInput('setCountry', value.country);
                }
              } else {
                if(value.charAt(0) !== '+') {
                  value = '+' + value;
                }
                elm.intlTelInput('setNumber', value);
              }
            }
            return value;
          });
        }
      };
    }]);
