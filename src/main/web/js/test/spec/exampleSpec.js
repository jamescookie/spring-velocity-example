require('../spec-helper.js');

describe('Home page', function () {

    var baseModel = function () {
        return {
            page: 'index',
            isPartyTime: false
        }
    };
    var model;

    beforeEach(function () {
        model = baseModel();
    });

    describe('Navigation', function () {

        beforeEach(function () {
            generate(model);
        });

        it('should have the correct active link', function () {
            expect($('.nav .active')).to.have.text('Home');
        });

        //it('should hide No store results error message if invalid postcode', function (done) {
        //    var errorMessage = 'No results';
        //    givenResponse({code: 404, url: '../ajax/stores?disableCnCStores=false', type: 'POST', data: ajaxError(errorMessage)});
        //
        //    deliveryPage.findStores('SL1 4DX');
        //
        //    executionComplete.then(function () {
        //        expect(deliveryPage.hasError(errorMessage));
        //
        //        deliveryPage.storePostcode.enter('BADPOSTCODE');
        //        deliveryPage.findStores();
        //
        //        expect(deliveryPage.hasNoErrors()).to.be.true;
        //        done();
        //    })
        //});
    });
});