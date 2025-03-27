"use strict";
(self["webpackChunkadminlte"] = self["webpackChunkadminlte"] || []).push([["src_app_pages_store_store_module_ts"],{

/***/ 8003:
/*!************************************************************!*\
  !*** ./src/app/pages/store/addstore/addstore.component.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AddstoreComponent": () => (/* binding */ AddstoreComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 1989);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _services_app_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/app.service */ 6475);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);















function AddstoreComponent_div_8_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
function AddstoreComponent_mat_option_50_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const country_r4 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", country_r4.code);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate2"]("", country_r4.code, " ", country_r4.name, "");
  }
}
function AddstoreComponent_mat_option_66_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function AddstoreComponent_mat_option_66_Template_mat_option_click_0_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r7);
      const address_r5 = restoredCtx.$implicit;
      const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r6.changeAddress(address_r5.place_id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const address_r5 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", address_r5.description);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", address_r5.description, " ");
  }
}
class AddstoreComponent {
  constructor(api, route, toastr, fb, router, appService) {
    this.api = api;
    this.route = route;
    this.toastr = toastr;
    this.fb = fb;
    this.router = router;
    this.appService = appService;
    this.isLoading = false;
    this.addresses = [];
    this.autocompleteService = new window['google'].maps.places.AutocompleteService();
    this.placesService = new window['google'].maps.places.PlacesService(document.createElement('div'));
    this.countryList = this.appService.getCountryList();
    this.storeForm = this.fb.group({
      store_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_ein: ['', []],
      image_url: ['', []],
      logo_url: ['', []],
      store_nick_name: ['', []],
      store_email: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_phone: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_phone_code: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      country: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      state: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      address_name: ['home'],
      address_line_1: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      address_line_2: ['', []],
      landmark: [''],
      city: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      postal_code: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      longitude: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      latitude: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      tax_value: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.min(0), _angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.max(100)]]
    });
    this.addressSearchForm = this.fb.group({
      change_address: ['']
    });
    this.addressSearchForm.controls.change_address.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.debounceTime)(500)).subscribe(value => {
      console.log(value);
      this.onInputChange(value);
    });
    this.getDefaultTax();
  }
  getDefaultTax() {
    const sub = this.api.getDefaultTax().subscribe(response => {
      sub.unsubscribe();
      this.storeForm.controls.tax_value.setValue(response.tax.tax_value);
    });
  }
  createStore() {
    if (!this.storeForm.valid) {
      return alert("Please fill all the necessary fields");
    }
    this.isLoading = true;
    const store = this.storeForm.value;
    const sub = this.api.createStore(store.store_name, store.store_ein, store.image_url, store.store_nick_name, store.store_phone, store.store_email, store.store_phone_code, store.country, store.state, store.address_name, store.address_line_1, store.address_line_2, store.landmark, store.city, store.postal_code, store.logo_url, store.longitude, store.latitude, store.tax_value).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(err => {
      this.isLoading = false;
      return err;
    })).subscribe(response => {
      this.isLoading = false;
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message || response.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/stores']);
    });
  }
  fileUpload(files) {
    this.isLoading = true;
    const sub = this.api.uploadSingleFile(files[0]).subscribe(response => {
      sub.unsubscribe();
      this.isLoading = false;
      this.imageUrl = response.urls.orignal_url;
      this.storeForm.controls.image_url.setValue(response.urls.orignal_url);
    });
  }
  logoUpload(files) {
    this.isLoading = true;
    const sub = this.api.uploadSingleFile(files[0]).subscribe(response => {
      sub.unsubscribe();
      this.isLoading = false;
      this.logoUrl = response.urls.orignal_url;
      this.storeForm.controls.logo_url.setValue(response.urls.orignal_url);
    });
  }
  onInputChange(input) {
    if (input === '') {
      this.addresses = [];
      return;
    }
    this.autocompleteService.getPlacePredictions({
      input: input
    }, (predictions, status) => {
      if (status === 'OK') {
        this.addresses = predictions;
      }
    });
  }
  changeAddress(placeId) {
    console.log(placeId);
    this.placesService.getDetails({
      placeId,
      fields: ['geometry', 'address_components']
    }, (result, status) => {
      if (status === 'OK') {
        const addressLine1 = this.extractComponentValue(result, 'street_number') + ' ' + this.extractComponentValue(result, 'route');
        const addressLine2 = this.extractComponentValue(result, 'address_line_2');
        const city = this.extractComponentValue(result, 'locality');
        const state = this.extractComponentValue(result, 'administrative_area_level_1');
        const country = this.extractComponentValue(result, 'country');
        const zipCode = this.extractComponentValue(result, 'postal_code');
        const latitude = result.geometry?.location.lat() || 0;
        const longitude = result.geometry?.location.lng() || 0;
        this.storeForm.controls.address_line_1.setValue(addressLine1.trim());
        this.storeForm.controls.address_line_2.setValue(addressLine2.trim());
        this.storeForm.controls.city.setValue(city.trim());
        this.storeForm.controls.state.setValue(state.trim());
        this.storeForm.controls.country.setValue(country.trim());
        this.storeForm.controls.postal_code.setValue(zipCode.trim());
        this.storeForm.controls.longitude.setValue(longitude);
        this.storeForm.controls.latitude.setValue(latitude);
      }
    });
  }
  extractComponentValue(result, componentType) {
    const component = result.address_components.find(comp => comp.types.includes(componentType));
    return component ? component.long_name : '';
  }
  static {
    this.ɵfac = function AddstoreComponent_Factory(t) {
      return new (t || AddstoreComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_7__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_app_service__WEBPACK_IMPORTED_MODULE_1__.AppService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: AddstoreComponent,
      selectors: [["app-addstore"]],
      decls: 135,
      vars: 11,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "content"], ["class", "overlay-spinner", 4, "ngIf"], ["autocomplete", "off", 1, "container-fluid", 3, "formGroup"], [1, "card"], [1, "card-body"], [1, "row"], [1, "col-md-6"], [1, "w-100"], ["matInput", "", "placeholder", "Enter Store", "formControlName", "store_name"], ["matInput", "", "placeholder", "Enter EIN", "formControlName", "store_ein", "maxlength", "11"], [1, "col-md-6", "mb-4"], ["type", "hidden", "formControlName", "logo_url", 3, "ngModel", "ngModelChange"], ["type", "file", 1, "file-upload", 3, "change"], ["type", "hidden", "formControlName", "image_url", 3, "ngModel", "ngModelChange"], ["matInput", "", "placeholder", "Enter Nick Name", "formControlName", "store_nick_name"], ["matInput", "", "placeholder", "Enter Email", "formControlName", "store_email"], ["formControlName", "store_phone_code", 3, "value"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", "matInput", "", "placeholder", "Enter Phone", "formControlName", "store_phone", "maxlength", "13"], [1, "col-12"], [1, "col-12", 3, "formGroup"], ["appearance", "fill", 1, "w-100"], ["type", "text", "placeholder", "Enter address", "aria-label", "Enter address", "matInput", "", "formControlName", "change_address", "autocomplete", "off", 3, "matAutocomplete"], ["autoActiveFirstOption", ""], ["auto", "matAutocomplete"], [3, "value", "click", 4, "ngFor", "ngForOf"], ["matInput", "", "placeholder", "Address Name 1", "formControlName", "address_line_1"], ["matInput", "", "placeholder", "Address Name 2", "formControlName", "address_line_2"], ["matInput", "", "placeholder", "City", "formControlName", "city"], ["matInput", "", "placeholder", "State", "formControlName", "state"], ["matInput", "", "placeholder", "Country", "formControlName", "country"], ["hidden", "", 1, "col-md-6"], ["matInput", "", "placeholder", "Enter Landmark", "formControlName", "landmark"], ["matInput", "", "placeholder", "Zip code", "formControlName", "postal_code"], ["matInput", "", "placeholder", "eg. home, office etc.", "formControlName", "address_name"], ["matInput", "", "placeholder", "72.123", "formControlName", "longitude"], ["matInput", "", "placeholder", "35.123", "formControlName", "latitude"], ["type", "number", "matInput", "", "placeholder", "Enter Tax", "formControlName", "tax_value"], [1, "col-md-6", "d-none"], ["disabled", "", 3, "value"], [3, "value"], [1, "col-12", "mt-3"], [1, "btn", "btn-primary", 3, "click"], [1, "overlay-spinner"], [3, "value", "click"]],
      template: function AddstoreComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](5, "Create Store");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](6, "div", 3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "section", 4);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](8, AddstoreComponent_div_8_Template, 2, 0, "div", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "form", 6)(10, "div", 7)(11, "div", 8)(12, "div", 9)(13, "div", 10)(14, "mat-form-field", 11)(15, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](16, "Store Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](17, "input", 12);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](18, "div", 10)(19, "mat-form-field", 11)(20, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](21, "EIN");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](22, "input", 13);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "div", 14)(24, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](25, "Image");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](26, "br");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](27, "input", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function AddstoreComponent_Template_input_ngModelChange_27_listener($event) {
            return ctx.logoUrl = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](28, "input", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function AddstoreComponent_Template_input_change_28_listener($event) {
            return ctx.fileUpload($event.target.files);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](29, "div", 14)(30, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](31, "Logo");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](32, "br");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](33, "input", 17);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function AddstoreComponent_Template_input_ngModelChange_33_listener($event) {
            return ctx.imageUrl = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](34, "input", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function AddstoreComponent_Template_input_change_34_listener($event) {
            return ctx.logoUpload($event.target.files);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](35, "div", 10)(36, "mat-form-field", 11)(37, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](38, "Nick Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](39, "input", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](40, "div", 10)(41, "mat-form-field", 11)(42, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](43, "Email");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](44, "input", 19);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](45, "div", 10)(46, "mat-form-field", 11)(47, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](48, "Country Code");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](49, "mat-select", 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](50, AddstoreComponent_mat_option_50_Template, 2, 3, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](51, "div", 10)(52, "mat-form-field", 11)(53, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](54, "Phone");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](55, "input", 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](56, "div", 23)(57, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](58, "Address");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](59, "div", 24)(60, "mat-form-field", 25)(61, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](62, "Search Address ");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](63, "input", 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](64, "mat-autocomplete", 27, 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](66, AddstoreComponent_mat_option_66_Template, 2, 2, "mat-option", 29);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](67, "div", 10)(68, "mat-form-field", 11)(69, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](70, "Address Line 1 ");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](71, "input", 30);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](72, "div", 10)(73, "mat-form-field", 11)(74, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](75, "Address Line 2");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](76, "input", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](77, "div", 10)(78, "mat-form-field", 11)(79, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](80, "City");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](81, "input", 32);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](82, "div", 10)(83, "mat-form-field", 11)(84, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](85, "State");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](86, "input", 33);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](87, "div", 10)(88, "mat-form-field", 11)(89, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](90, "Country");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](91, "input", 34);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](92, "div", 35)(93, "mat-form-field", 11)(94, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](95, "Landmark");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](96, "input", 36);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](97, "div", 10)(98, "mat-form-field", 11)(99, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](100, "Zip Code");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](101, "input", 37);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](102, "div", 35)(103, "mat-form-field", 11)(104, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](105, "Address Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](106, "input", 38);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](107, "div", 10)(108, "mat-form-field", 11)(109, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](110, "Longitude");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](111, "input", 39);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](112, "div", 10)(113, "mat-form-field", 11)(114, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](115, "Latitude");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](116, "input", 40);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](117, "div", 23)(118, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](119, "Tax");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](120, "div", 10)(121, "mat-form-field", 11)(122, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](123, "Tax (%)");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](124, "input", 41);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](125, "div", 42)(126, "mat-form-field", 11)(127, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](128, "Tax Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](129, "mat-select", 43)(130, "mat-option", 44);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](131, "Percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](132, "div", 45)(133, "button", 46);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function AddstoreComponent_Template_button_click_133_listener() {
            return ctx.createStore();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](134, "Create Store");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](65);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.storeForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](18);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.logoUrl);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.imageUrl);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](16);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", +1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.countryList);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](9);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.addressSearchForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matAutocomplete", _r2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.addresses);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](63);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", "percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", "percentage");
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_8__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.MaxLengthValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormControlName, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_10__.MatInput, _angular_material_select__WEBPACK_IMPORTED_MODULE_11__.MatSelect, _angular_material_core__WEBPACK_IMPORTED_MODULE_12__.MatOption, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__.MatProgressSpinner, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocomplete, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocompleteTrigger],
      styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 4424:
/*!******************************************************************************!*\
  !*** ./src/app/pages/store/bulk-create-store/bulk-create-store.component.ts ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BulkCreateStoreComponent": () => (/* binding */ BulkCreateStoreComponent)
/* harmony export */ });
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! environments/environment */ 2340);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);










function BulkCreateStoreComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
class BulkCreateStoreComponent {
  constructor(api, route, toastr, fb, router) {
    this.api = api;
    this.route = route;
    this.toastr = toastr;
    this.fb = fb;
    this.router = router;
    this.isLoading = false;
    this.env = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment;
  }
  createBulkStores(files) {
    if (!files.length) {
      return alert("Please select file");
    }
    this.isLoading = true;
    const sub = this.api.createBulkStores(files[0]).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_3__.catchError)(err => {
      this.isLoading = false;
      return err;
    })).subscribe(response => {
      this.isLoading = false;
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      sub.unsubscribe();
      this.toastr.success(response?.message);
      this.router.navigate(['/stores']);
    });
  }
  static {
    this.ɵfac = function BulkCreateStoreComponent_Factory(t) {
      return new (t || BulkCreateStoreComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_1__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_5__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_6__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_4__.Router));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: BulkCreateStoreComponent,
      selectors: [["app-bulk-create-store"]],
      decls: 22,
      vars: 1,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "float-sm-right"], ["href", "/assets/files/new_store.xlsx", "download", "store", 1, "btn", "btn-warning"], [1, "content"], ["class", "overlay-spinner", 4, "ngIf"], [1, "card"], [1, "card-body"], [1, "row"], [1, "col-md-4"], ["type", "file", "accept", ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"], ["file", ""], [1, "col-12", "mt-3"], [1, "btn", "btn-primary", 3, "click"], [1, "overlay-spinner"]],
      template: function BulkCreateStoreComponent_Template(rf, ctx) {
        if (rf & 1) {
          const _r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](5, "Create stores (bulk)");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 3)(7, "div", 4)(8, "a", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](9, "Download XLSX file");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](10, "section", 6);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](11, BulkCreateStoreComponent_div_11_Template, 2, 0, "div", 7);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "form", 1)(13, "div", 8)(14, "div", 9)(15, "div", 10)(16, "div", 11);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](17, "input", 12, 13);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](19, "div", 14)(20, "button", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function BulkCreateStoreComponent_Template_button_click_20_listener() {
            _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r2);
            const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](18);
            return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx.createBulkStores(_r1.files));
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](21, "Create Stores");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](11);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_6__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_6__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_6__.NgForm, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_8__.MatProgressSpinner],
      styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 8012:
/*!****************************************************************!*\
  !*** ./src/app/pages/store/store-list/store-list.component.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StoreListComponent": () => (/* binding */ StoreListComponent)
/* harmony export */ });
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/paginator */ 6060);
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/sort */ 2197);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 9337);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 1339);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 6646);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 4874);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 2673);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 635);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/table */ 5288);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/button */ 4522);
/* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/menu */ 8589);
/* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/icon */ 7822);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);


















function StoreListComponent_div_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_th_27_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Store Id ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_28_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r17 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r17.store_id, " ");
  }
}
function StoreListComponent_th_30_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Name ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_31_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r18 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r18.store_name, " ");
  }
}
function StoreListComponent_th_33_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Email ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_34_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r19 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r19.store_email, " ");
  }
}
function StoreListComponent_th_36_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Phone ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_37_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r20 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r20.store_phone, " ");
  }
}
function StoreListComponent_th_39_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Owner ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_40_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r21 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r21.store_owner, " ");
  }
}
function StoreListComponent_th_42_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Status ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_43_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r22 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r22.is_verified ? "Verified" : "Unverfied", " ");
  }
}
function StoreListComponent_th_45_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Actions ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function StoreListComponent_td_46_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 35)(1, "button", 38)(2, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "mat-menu", null, 39)(6, "button", 40)(7, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "remove_red_eye");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10, "View");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const element_r23 = ctx.$implicit;
    const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matMenuTriggerFor", _r24);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/stores/storedetail/" + element_r23.store_id);
  }
}
function StoreListComponent_tr_47_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "tr", 41);
  }
}
function StoreListComponent_tr_48_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "tr", 42);
  }
}
const _c0 = function () {
  return [5, 10, 20];
};
class StoreListComponent {
  constructor(api, fb) {
    this.api = api;
    this.fb = fb;
    this.query = "";
    this.isLoadingResults = true;
    this.displayedColumns = ['store_id', 'store_name', 'Email', 'Phone', 'Owner', 'Status', 'Action'];
    this.data = [];
    this.resultsLength = 0;
    this.sortBy = 'store_id';
    this.filterForm = this.fb.group({
      q: ['', []]
    });
    this.filterForm.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.tap)(() => this.isLoadingResults = true), (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.delay)(1000)).subscribe(() => {
      this.api.listStores(this.query, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction).subscribe(data => {
        this.isLoadingResults = false;
        if (data === null) {
          return [];
        }
        this.resultsLength = data.total_count;
        this.data = data.stores.map(store => {
          return {
            store_id: store.store_id,
            store_name: store.store_name,
            store_email: store.store_email,
            store_phone: store.store_phone_code + '-' + store.store_phone,
            store_owner: store.store_users.length ? store.store_users[0].user.first_name + ' ' + store.store_users[0].user.last_name : 'NA',
            is_verified: store.is_verified
          };
        });
      });
    });
  }
  ngOnInit() {}
  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });
    (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.merge)(this.sort.sortChange, this.paginator.page).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.startWith)({}), (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.switchMap)(() => {
      this.isLoadingResults = true;
      return this.api.listStores(this.query, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_7__.map)(data => {
      this.isLoadingResults = false;
      // Flip flag to show that loading has finished.
      if (data === null) {
        return [];
      }
      this.resultsLength = data.total_count;
      return data.stores.map(store => {
        return {
          store_id: store.store_id,
          store_name: store.store_name,
          store_email: store.store_email,
          store_phone: store.store_phone_code + '-' + store.store_phone,
          store_owner: store.store_users.length ? store.store_users[0].user.first_name + ' ' + store.store_users[0].user.last_name : 'NA',
          is_verified: store.is_verified
        };
      });
    })).subscribe(data => this.data = data);
  }
  static {
    this.ɵfac = function StoreListComponent_Factory(t) {
      return new (t || StoreListComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormBuilder));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: StoreListComponent,
      selectors: [["app-store-list"]],
      viewQuery: function StoreListComponent_Query(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_angular_material_paginator__WEBPACK_IMPORTED_MODULE_9__.MatPaginator, 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵviewQuery"](_angular_material_sort__WEBPACK_IMPORTED_MODULE_10__.MatSort, 5);
        }
        if (rf & 2) {
          let _t;
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.paginator = _t.first);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵqueryRefresh"](_t = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵloadQuery"]()) && (ctx.sort = _t.first);
        }
      },
      decls: 50,
      vars: 12,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "col-sm-6", "d-flex", "flex-wrap"], [1, "btn-group", "ml-auto"], [1, "btn", "btn-primary", 3, "routerLink"], [1, "btn-group", "ml-3"], [1, "btn", "btn-secondary", 3, "routerLink"], [1, "content"], [1, "container-fluid", "mb-4"], [1, "card", "py-3"], [1, "card-head", "d-flex", 3, "formGroup"], [1, "ml-3"], ["matInput", "", "placeholder", "Search", "formControlName", "q", 3, "ngModel", "ngModelChange"], [1, "container-fluid", "pb-5", "position-relative"], ["class", "overlay-spinner", 4, "ngIf"], [1, "mat-elevation-z8"], ["mat-table", "", "matSort", "", "matSortDisableClear", "", "matSortDirection", "desc", 3, "dataSource", "matSortActive"], ["matColumnDef", "store_id"], ["mat-header-cell", "", "mat-sort-header", "", "disableClear", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "store_name"], ["mat-header-cell", "", "mat-sort-header", "", 4, "matHeaderCellDef"], ["matColumnDef", "Email"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["matColumnDef", "Phone"], ["matColumnDef", "Owner"], ["matColumnDef", "Status"], ["matColumnDef", "Action"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", "aria-label", "Select page of periodic elements", 3, "pageSizeOptions", "length"], [1, "overlay-spinner"], ["mat-header-cell", "", "mat-sort-header", "", "disableClear", ""], ["mat-cell", ""], ["mat-header-cell", "", "mat-sort-header", ""], ["mat-header-cell", ""], ["mat-icon-button", "", "aria-label", "Example icon-button with a menu", 3, "matMenuTriggerFor"], ["menu", "matMenu"], ["mat-menu-item", "", 1, "pr-5", 3, "routerLink"], ["mat-header-row", ""], ["mat-row", ""]],
      template: function StoreListComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Stores List");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 4)(7, "div", 5)(8, "button", 6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, " Create Store ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 7)(11, "button", 8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](12, " Create Stores (bulk) ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](13, "div", 4);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "section", 9)(15, "div", 10)(16, "div", 11)(17, "form", 12)(18, "mat-form-field", 13)(19, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](20, "Search");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "input", 14);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function StoreListComponent_Template_input_ngModelChange_21_listener($event) {
            return ctx.query = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](22, "div", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](23, StoreListComponent_div_23_Template, 2, 0, "div", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "div", 17)(25, "table", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](26, 19);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](27, StoreListComponent_th_27_Template, 2, 0, "th", 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](28, StoreListComponent_td_28_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](29, 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](30, StoreListComponent_th_30_Template, 2, 0, "th", 23);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](31, StoreListComponent_td_31_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](32, 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](33, StoreListComponent_th_33_Template, 2, 0, "th", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](34, StoreListComponent_td_34_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](35, 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](36, StoreListComponent_th_36_Template, 2, 0, "th", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](37, StoreListComponent_td_37_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](38, 27);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](39, StoreListComponent_th_39_Template, 2, 0, "th", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](40, StoreListComponent_td_40_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](41, 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](42, StoreListComponent_th_42_Template, 2, 0, "th", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](43, StoreListComponent_td_43_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](44, 29);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](45, StoreListComponent_th_45_Template, 2, 0, "th", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](46, StoreListComponent_td_46_Template, 11, 2, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](47, StoreListComponent_tr_47_Template, 1, 0, "tr", 30);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](48, StoreListComponent_tr_48_Template, 1, 0, "tr", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](49, "mat-paginator", 32);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/stores/addstore/");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/stores/bulkstore/");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.filterForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx.query);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.isLoadingResults);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("dataSource", ctx.data)("matSortActive", ctx.sortBy);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matHeaderRowDef", ctx.displayedColumns);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matRowDefColumns", ctx.displayedColumns);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("pageSizeOptions", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](11, _c0))("length", ctx.resultsLength);
        }
      },
      dependencies: [_angular_router__WEBPACK_IMPORTED_MODULE_11__.RouterLink, _angular_common__WEBPACK_IMPORTED_MODULE_12__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_8__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_8__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormControlName, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatTable, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatHeaderCellDef, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatHeaderRowDef, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatColumnDef, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatCellDef, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatRowDef, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatHeaderCell, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatCell, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatHeaderRow, _angular_material_table__WEBPACK_IMPORTED_MODULE_13__.MatRow, _angular_material_paginator__WEBPACK_IMPORTED_MODULE_9__.MatPaginator, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_14__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_15__.MatInput, _angular_material_button__WEBPACK_IMPORTED_MODULE_16__.MatIconButton, _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__.MatMenu, _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__.MatMenuItem, _angular_material_menu__WEBPACK_IMPORTED_MODULE_17__.MatMenuTrigger, _angular_material_icon__WEBPACK_IMPORTED_MODULE_18__.MatIcon, _angular_material_sort__WEBPACK_IMPORTED_MODULE_10__.MatSort, _angular_material_sort__WEBPACK_IMPORTED_MODULE_10__.MatSortHeader, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_19__.MatProgressSpinner],
      styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 1662:
/*!*****************************************************!*\
  !*** ./src/app/pages/store/store-routing.module.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StoreRoutingModule": () => (/* binding */ StoreRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _addstore_addstore_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./addstore/addstore.component */ 8003);
/* harmony import */ var _bulk_create_store_bulk_create_store_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bulk-create-store/bulk-create-store.component */ 4424);
/* harmony import */ var _store_list_store_list_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./store-list/store-list.component */ 8012);
/* harmony import */ var _storedetail_storedetail_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./storedetail/storedetail.component */ 6445);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);







const routes = [{
  path: '',
  component: _store_list_store_list_component__WEBPACK_IMPORTED_MODULE_2__.StoreListComponent
}, {
  path: 'addstore',
  component: _addstore_addstore_component__WEBPACK_IMPORTED_MODULE_0__.AddstoreComponent
}, {
  path: 'storedetail/:id',
  component: _storedetail_storedetail_component__WEBPACK_IMPORTED_MODULE_3__.StoredetailComponent
}, {
  path: 'bulkstore',
  component: _bulk_create_store_bulk_create_store_component__WEBPACK_IMPORTED_MODULE_1__.BulkCreateStoreComponent
}];
class StoreRoutingModule {
  static {
    this.ɵfac = function StoreRoutingModule_Factory(t) {
      return new (t || StoreRoutingModule)();
    };
  }
  static {
    this.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({
      type: StoreRoutingModule
    });
  }
  static {
    this.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({
      imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule.forChild(routes), _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
    });
  }
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](StoreRoutingModule, {
    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule],
    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
  });
})();

/***/ }),

/***/ 9069:
/*!*********************************************!*\
  !*** ./src/app/pages/store/store.module.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StoreModule": () => (/* binding */ StoreModule)
/* harmony export */ });
/* harmony import */ var _store_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./store-routing.module */ 1662);
/* harmony import */ var _addstore_addstore_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./addstore/addstore.component */ 8003);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/shared/shared.module */ 4466);
/* harmony import */ var _store_list_store_list_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./store-list/store-list.component */ 8012);
/* harmony import */ var _storedetail_storedetail_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./storedetail/storedetail.component */ 6445);
/* harmony import */ var _bulk_create_store_bulk_create_store_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./bulk-create-store/bulk-create-store.component */ 4424);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 2560);







class StoreModule {
  static {
    this.ɵfac = function StoreModule_Factory(t) {
      return new (t || StoreModule)();
    };
  }
  static {
    this.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineNgModule"]({
      type: StoreModule
    });
  }
  static {
    this.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineInjector"]({
      imports: [_store_routing_module__WEBPACK_IMPORTED_MODULE_0__.StoreRoutingModule, _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__.SharedModule]
    });
  }
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵsetNgModuleScope"](StoreModule, {
    declarations: [_addstore_addstore_component__WEBPACK_IMPORTED_MODULE_1__.AddstoreComponent, _store_list_store_list_component__WEBPACK_IMPORTED_MODULE_3__.StoreListComponent, _storedetail_storedetail_component__WEBPACK_IMPORTED_MODULE_4__.StoredetailComponent, _bulk_create_store_bulk_create_store_component__WEBPACK_IMPORTED_MODULE_5__.BulkCreateStoreComponent],
    imports: [_store_routing_module__WEBPACK_IMPORTED_MODULE_0__.StoreRoutingModule, _shared_shared_module__WEBPACK_IMPORTED_MODULE_2__.SharedModule]
  });
})();

/***/ }),

/***/ 6445:
/*!******************************************************************!*\
  !*** ./src/app/pages/store/storedetail/storedetail.component.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StoredetailComponent": () => (/* binding */ StoredetailComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 1989);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _services_app_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/app.service */ 6475);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);















function StoredetailComponent_div_7_button_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "button", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function StoredetailComponent_div_7_button_1_Template_button_click_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r6);
      const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r5.verifyStore());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, "Verify store");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
function StoredetailComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, StoredetailComponent_div_7_button_1_Template, 2, 0, "button", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r0.store.has_store_owner && !ctx_r0.store.is_verified);
  }
}
function StoredetailComponent_div_12_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
function StoredetailComponent_mat_option_58_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const country_r7 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", country_r7.code);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate2"](" ", country_r7.code, " ", country_r7.name, "");
  }
}
function StoredetailComponent_ng_container_74_mat_option_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function StoredetailComponent_ng_container_74_mat_option_14_Template_mat_option_click_0_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r14);
      const address_r12 = restoredCtx.$implicit;
      const ctx_r13 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r13.changeAddress(address_r12.place_id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const address_r12 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", address_r12.description);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", address_r12.description, " ");
  }
}
function StoredetailComponent_ng_container_74_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "div", 34)(2, "div", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](3, "input", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "div", 34)(5, "h1");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6, "Address");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "div", 45)(8, "mat-form-field", 29)(9, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10, "Search Address ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](11, "input", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "mat-autocomplete", 47, 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](14, StoredetailComponent_ng_container_74_mat_option_14_Template, 2, 2, "mat-option", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "div", 13)(16, "mat-form-field", 14)(17, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](18, "Address Line 1 ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](19, "input", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](20, "div", 13)(21, "mat-form-field", 14)(22, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](23, "Address Line 2");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](24, "input", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](25, "div", 13)(26, "mat-form-field", 14)(27, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](28, "City");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](29, "input", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](30, "div", 13)(31, "mat-form-field", 14)(32, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](33, "Country");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](34, "input", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](35, "div", 13)(36, "mat-form-field", 14)(37, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](38, "State");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](39, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](40, "div", 55)(41, "mat-form-field", 14)(42, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](43, "Landmark");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](44, "input", 56);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](45, "div", 13)(46, "mat-form-field", 14)(47, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](48, "Postal Code");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](49, "input", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](50, "div", 55)(51, "mat-form-field", 14)(52, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](53, "Address Name");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](54, "input", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](55, "div", 13)(56, "mat-form-field", 14)(57, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](58, "Longitude");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](59, "input", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](60, "div", 13)(61, "mat-form-field", 14)(62, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](63, "Latitude");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](64, "input", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const address_r8 = ctx.$implicit;
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](13);
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", address_r8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx_r3.addressSearchForm);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matAutocomplete", _r10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r3.addresses);
  }
}
class StoredetailComponent {
  constructor(api, route, toastr, fb, router, appService) {
    this.api = api;
    this.route = route;
    this.toastr = toastr;
    this.fb = fb;
    this.router = router;
    this.appService = appService;
    this.addresses = [];
    this.isLoading = true;
    this.countryList = [];
    this.autocompleteService = new window['google'].maps.places.AutocompleteService();
    this.placesService = new window['google'].maps.places.PlacesService(document.createElement('div'));
    this.countryList = this.appService.getCountryList();
    this.storeForm = this.fb.group({
      has_store_owner: [false, []],
      is_verified: [false, []],
      store_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_ein: ['', []],
      image_url: ['', []],
      logo_url: ['', []],
      is_enabled: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_nick_name: ['', []],
      store_email: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_phone: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      store_phone_code: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
      tax_value: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.min(0), _angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.max(100)]],
      store_addresses: this.fb.array([this.fb.group({
        store_address_id: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        country: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        state: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        address_name: [''],
        address_line_1: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        address_line_2: ['', []],
        landmark: [''],
        city: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        postal_code: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        longitude: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]],
        latitude: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]]
      })])
    });
    this.addressSearchForm = this.fb.group({
      change_address: ['']
    });
    this.addressSearchForm.controls.change_address.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.debounceTime)(500)).subscribe(value => {
      console.log(value);
      this.onInputChange(value);
    });
    this.route.params.subscribe(p => {
      this.store_id = p.id;
      this.getStoreDetails();
    });
  }
  ngOnInit() {}
  get store_addresses() {
    return this.storeForm.controls['store_addresses'];
  }
  setImage(orignal_url) {
    this.storeForm.value.image_url = orignal_url;
  }
  getStoreDetails() {
    const subscription = this.api.getStoreDetails(this.store_id).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(err => {
      return err;
    })).subscribe(response => {
      subscription.unsubscribe();
      if (response.status > 400) {
        this.toastr.error(response.error.message);
        this.router.navigate(['/stores']);
        return;
      }
      this.isLoading = false;
      const store = response.store;
      this.imageUrl = store.image.dynamic_url;
      this.logoUrl = store.logo.dynamic_url;
      this.store = {
        has_store_owner: store.has_store_owner,
        is_verified: store.is_verified,
        store_name: store.store_name,
        store_ein: store.store_ein,
        store_nick_name: store.store_nick_name,
        image_url: store.image.orignal_url,
        logo_url: store.logo.orignal_url,
        store_email: store.store_email,
        store_phone_code: store.store_phone_code,
        store_phone: store.store_phone,
        is_enabled: store.is_enabled,
        tax_value: store.tax_value,
        store_addresses: store.store_addresses.map(address => {
          return {
            store_address_id: address.store_address_id,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            address_name: address.address_name,
            postal_code: address.postal_code,
            landmark: address.landmark,
            city: address.city,
            longitude: address.longitude,
            latitude: address.latitude,
            state: address.state.state_name,
            country: address.state.country.country_name
          };
        })
      };
      this.storeForm.setValue(this.store);
    });
  }
  updateDetails() {
    if (!this.storeForm.valid) {
      return alert("Please fill all the necessary fields");
    }
    this.isLoading = true;
    const store_name = this.storeForm.value.store_name;
    const store_nick_name = this.storeForm.value.store_nick_name;
    const store_ein = this.storeForm.value.store_ein;
    const image_url = this.storeForm.value.image_url;
    const logo_url = this.storeForm.value.logo_url;
    const is_enabled = this.storeForm.value.is_enabled;
    const tax_value = this.storeForm.value.tax_value;
    const store_phone_code = this.storeForm.value.store_phone_code;
    const store_phone = this.storeForm.value.store_phone;
    const store_email = this.storeForm.value.store_email;
    const address_name = this.storeForm.value.store_addresses[0].address_name;
    const address_line_1 = this.storeForm.value.store_addresses[0].address_line_1;
    const address_line_2 = this.storeForm.value.store_addresses[0].address_line_2;
    const landmark = this.storeForm.value.store_addresses[0].landmark;
    const city = this.storeForm.value.store_addresses[0].city;
    const postal_code = this.storeForm.value.store_addresses[0].postal_code;
    const country = this.storeForm.value.store_addresses[0].country;
    const state = this.storeForm.value.store_addresses[0].state;
    const store_address_id = this.storeForm.value.store_addresses[0].store_address_id;
    const longitude = this.storeForm.value.store_addresses[0].longitude;
    const latitude = this.storeForm.value.store_addresses[0].latitude;
    const sub = this.api.storeUpdate(this.store_id, store_name, store_ein, image_url, store_nick_name, store_phone, store_email, store_phone_code, country, state, address_name, address_line_1, address_line_2, landmark, city, postal_code, store_address_id, logo_url, is_enabled, longitude, latitude, tax_value).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(err => {
      this.isLoading = false;
      return err;
    })).subscribe(response => {
      this.isLoading = false;
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message || response.message);
        return;
      }
      this.toastr.success(response?.message);
      this.router.navigate(['/stores']);
    });
  }
  blockStore() {
    const sub = this.api.blockStore(this.store_id).subscribe(() => {
      sub.unsubscribe();
      this.toastr.success("User blocked successfully");
      this.getStoreDetails();
    });
  }
  unblockStore() {
    const sub = this.api.unblockStore(this.store_id).subscribe(() => {
      sub.unsubscribe();
      this.toastr.success("User unblocked successfully");
      this.getStoreDetails();
    });
  }
  deleteStore() {
    const sub = this.api.deleteStore(this.store_id).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(err => {
      return err;
    })).subscribe(response => {
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/stores']);
    });
  }
  fileUpload(files) {
    this.isLoading = true;
    const sub = this.api.uploadSingleFile(files[0]).subscribe(response => {
      sub.unsubscribe();
      this.isLoading = false;
      this.storeForm.controls.image_url.setValue(response.urls.orignal_url);
      this.imageUrl = response.urls.dynamic_url;
    });
  }
  logoUpload(files) {
    this.isLoading = true;
    const sub = this.api.uploadSingleFile(files[0]).subscribe(response => {
      sub.unsubscribe();
      this.isLoading = false;
      this.storeForm.controls.logo_url.setValue(response.urls.orignal_url);
      this.logoUrl = response.urls.dynamic_url;
    });
  }
  onInputChange(input) {
    if (input === '') {
      this.addresses = [];
      return;
    }
    this.autocompleteService.getPlacePredictions({
      input: input
    }, (predictions, status) => {
      if (status === 'OK') {
        this.addresses = predictions;
      }
    });
  }
  changeAddress(placeId) {
    this.placesService.getDetails({
      placeId,
      fields: ['geometry', 'address_components']
    }, (result, status) => {
      if (status === 'OK') {
        const addressLine1 = this.extractComponentValue(result, 'street_number') + ' ' + this.extractComponentValue(result, 'route');
        const addressLine2 = this.extractComponentValue(result, 'address_line_2');
        const city = this.extractComponentValue(result, 'locality');
        const state = this.extractComponentValue(result, 'administrative_area_level_1');
        const country = this.extractComponentValue(result, 'country');
        const zipCode = this.extractComponentValue(result, 'postal_code');
        const latitude = result.geometry?.location.lat() || 0;
        const longitude = result.geometry?.location.lng() || 0;
        const fa = this.storeForm.controls.store_addresses;
        const fg = fa.controls[0];
        fg.controls.address_line_1.setValue(addressLine1.trim());
        fg.controls.address_line_2.setValue(addressLine2.trim());
        fg.controls.city.setValue(city.trim());
        fg.controls.state.setValue(state.trim());
        fg.controls.country.setValue(country.trim());
        fg.controls.postal_code.setValue(zipCode.trim());
        fg.controls.longitude.setValue(longitude);
        fg.controls.latitude.setValue(latitude);
        console.log(fg.value);
      }
    });
  }
  extractComponentValue(result, componentType) {
    const component = result.address_components.find(comp => comp.types.includes(componentType));
    return component ? component.long_name : '';
  }
  verifyStore() {
    this.isLoading = true;
    const sub = this.api.verifyStore(this.store_id).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_5__.catchError)(err => {
      return err;
    })).subscribe(response => {
      this.isLoading = false;
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/stores']);
    });
  }
  static {
    this.ɵfac = function StoredetailComponent_Factory(t) {
      return new (t || StoredetailComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_7__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_app_service__WEBPACK_IMPORTED_MODULE_1__.AppService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: StoredetailComponent,
      selectors: [["app-storedetail"]],
      decls: 93,
      vars: 12,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "col-sm-6", "d-flex", "justify-content-end"], [4, "ngIf"], [1, "btn", "btn-danger", 3, "click"], [1, "content"], ["class", "overlay-spinner", 4, "ngIf"], [1, "container-fluid", 3, "formGroup"], [1, "card"], [1, "card-body"], [1, "row"], [1, "col-md-6"], [1, "w-100"], ["matInput", "", "placeholder", "Enter Store", "formControlName", "store_name"], ["matInput", "", "placeholder", "Enter EIN", "formControlName", "store_ein", "maxlength", "11"], [1, "col-md-6", "d-flex", "mb-4"], ["width", "100", "height", "auto", "alt", "", 3, "src"], [1, "ml-3"], ["type", "hidden", "formControlName", "image_url"], ["type", "file", 1, "file-upload", 3, "change"], [1, "col-md-6", "mb-4", "d-flex"], ["type", "hidden", "formControlName", "logo_url"], ["matInput", "", "placeholder", "Enter Nick Name", "formControlName", "store_nick_name"], ["matInput", "", "placeholder", "Enter Email", "formControlName", "store_email"], ["formControlName", "store_phone_code", 3, "value"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", "matInput", "", "placeholder", "Enter Phone", "formControlName", "store_phone", "maxlength", "13"], ["appearance", "fill", 1, "w-100"], ["formControlName", "is_enabled"], [3, "value"], ["formArrayName", "store_addresses", 1, "row"], [4, "ngFor", "ngForOf"], [1, "col-12"], ["type", "number", "matInput", "", "placeholder", "Enter Tax", "formControlName", "tax_value"], [1, "col-md-6", "d-none"], ["disabled", "", 3, "value"], [1, "col-12", "mt-3"], [1, "btn", "btn-primary", 3, "click"], ["class", "btn btn-primary mr-3 ", 3, "click", 4, "ngIf"], [1, "btn", "btn-primary", "mr-3", 3, "click"], [1, "overlay-spinner"], [1, "row", 3, "formGroup"], ["type", "hidden", "formControlName", "store_address_id"], [1, "col-12", 3, "formGroup"], ["type", "text", "placeholder", "Enter address", "aria-label", "Enter address", "matInput", "", "formControlName", "change_address", "autocomplete", "off", 3, "matAutocomplete"], ["autoActiveFirstOption", ""], ["auto", "matAutocomplete"], [3, "value", "click", 4, "ngFor", "ngForOf"], ["matInput", "", "placeholder", "Address Name 1", "formControlName", "address_line_1"], ["matInput", "", "placeholder", "Address Name 2", "formControlName", "address_line_2"], ["matInput", "", "placeholder", "City", "formControlName", "city"], ["matInput", "", "placeholder", "Country", "formControlName", "country"], ["matInput", "", "placeholder", "State", "formControlName", "state"], ["hidden", "", 1, "col-md-6"], ["matInput", "", "placeholder", "Enter Landmark", "formControlName", "landmark"], ["matInput", "", "placeholder", "Zip code", "formControlName", "postal_code"], ["matInput", "", "placeholder", "eg. home, office etc.", "formControlName", "address_name"], ["matInput", "", "placeholder", "72.123", "formControlName", "longitude"], ["matInput", "", "placeholder", "35.123", "formControlName", "latitude"], [3, "value", "click"]],
      template: function StoredetailComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](5, "Store Details");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 4);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](7, StoredetailComponent_div_7_Template, 2, 1, "div", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](8, "button", 6);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function StoredetailComponent_Template_button_click_8_listener() {
            return ctx.deleteStore();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](9, "Delete store");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](10, "div", 3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](11, "section", 7);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](12, StoredetailComponent_div_12_Template, 2, 0, "div", 8);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "form", 9)(14, "div", 10)(15, "div", 11)(16, "div", 12)(17, "div", 13)(18, "mat-form-field", 14)(19, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](20, "Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](21, "input", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](22, "div", 13)(23, "mat-form-field", 14)(24, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](25, "EIN");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](26, "input", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](27, "div", 17);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](28, "img", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](29, "div", 19)(30, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](31, "Upload Image");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](32, "br")(33, "input", 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](34, "input", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function StoredetailComponent_Template_input_change_34_listener($event) {
            return ctx.fileUpload($event.target.files);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](35, "div", 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](36, "img", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](37, "div", 19)(38, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](39, "Logo");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](40, "br")(41, "input", 23);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](42, "input", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("change", function StoredetailComponent_Template_input_change_42_listener($event) {
            return ctx.logoUpload($event.target.files);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](43, "div", 13)(44, "mat-form-field", 14)(45, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](46, "Nick Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](47, "input", 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](48, "div", 13)(49, "mat-form-field", 14)(50, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](51, "Email");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](52, "input", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](53, "div", 13)(54, "mat-form-field", 14)(55, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](56, "Country Code");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](57, "mat-select", 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](58, StoredetailComponent_mat_option_58_Template, 2, 3, "mat-option", 27);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](59, "div", 13)(60, "mat-form-field", 14)(61, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](62, "Phone");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](63, "input", 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](64, "div", 13)(65, "mat-form-field", 29)(66, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](67, "Status");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](68, "mat-select", 30)(69, "mat-option", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](70, "Enabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](71, "mat-option", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](72, "Disabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](73, "div", 32);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](74, StoredetailComponent_ng_container_74_Template, 65, 4, "ng-container", 33);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](75, "div", 34)(76, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](77, "Tax");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](78, "div", 13)(79, "mat-form-field", 14)(80, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](81, "Tax (%)");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](82, "input", 35);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](83, "div", 36)(84, "mat-form-field", 14)(85, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](86, "Tax Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](87, "mat-select", 37)(88, "mat-option", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](89, "Percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](90, "div", 38)(91, "button", 39);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function StoredetailComponent_Template_button_click_91_listener() {
            return ctx.updateDetails();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](92, "Update Store");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](7);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.store);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.storeForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](15);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("src", ctx.imageUrl, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"]);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("src", ctx.logoUrl, _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵsanitizeUrl"]);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](21);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", +1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.countryList);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](11);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", true);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", false);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.store_addresses.controls);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](13);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", "percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", "percentage");
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_8__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_8__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.MaxLengthValidator, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormArrayName, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_9__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_10__.MatInput, _angular_material_select__WEBPACK_IMPORTED_MODULE_11__.MatSelect, _angular_material_core__WEBPACK_IMPORTED_MODULE_12__.MatOption, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__.MatProgressSpinner, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocomplete, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocompleteTrigger],
      styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ })

}]);
//# sourceMappingURL=src_app_pages_store_store_module_ts.js.map