"use strict";
(self["webpackChunkadminlte"] = self["webpackChunkadminlte"] || []).push([["src_app_pages_products_products_module_ts"],{

/***/ 1982:
/*!***************************************************************************************!*\
  !*** ./src/app/pages/products/bulk-create-products/bulk-create-products.component.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BulkCreateProductsComponent": () => (/* binding */ BulkCreateProductsComponent)
/* harmony export */ });
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! environments/environment */ 2340);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 1989);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs */ 9337);
/* harmony import */ var rxjs_internal_operators_catchError__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/internal/operators/catchError */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);















function BulkCreateProductsComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
function BulkCreateProductsComponent_mat_option_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "mat-option", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function BulkCreateProductsComponent_mat_option_25_Template_mat_option_click_0_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r6);
      const store_r4 = restoredCtx.$implicit;
      const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r5.changeStore(store_r4));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const store_r4 = ctx.$implicit;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵclassProp"]("checked", store_r4.store_id == ctx_r2.storeId);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("value", store_r4.store_name);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", store_r4.store_name, " ");
  }
}
class BulkCreateProductsComponent {
  constructor(api, route, toastr, fb, router) {
    this.api = api;
    this.route = route;
    this.toastr = toastr;
    this.fb = fb;
    this.router = router;
    this.isLoading = false;
    this.env = environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment;
    this.stores = [];
    this.storeId = null;
    this.storeForm = this.fb.group({
      store_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_3__.Validators.required]]
    });
    this.storeForm.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.debounceTime)(500), (0,rxjs__WEBPACK_IMPORTED_MODULE_5__.tap)(() => {
      this.listStores(this.storeForm.value.store_name);
    })).subscribe();
    this.listStores(this.storeForm.value.store_name);
  }
  listStores(q) {
    const sub = this.api.listStores(q, 1, 100, 'store_id', 'DESC').subscribe(response => {
      sub.unsubscribe();
      this.stores = response.stores.map(({
        store_name,
        store_id
      }) => {
        return {
          store_name,
          store_id
        };
      });
    });
  }
  changeStore(store) {
    this.selectedStore = store;
    this.storeId = store.store_id;
  }
  createBulkProducts(files) {
    if (!files.length) {
      return alert("Please select file");
    }
    this.isLoading = true;
    const sub = this.api.createBulkProducts(files[0], this.storeId).pipe((0,rxjs_internal_operators_catchError__WEBPACK_IMPORTED_MODULE_6__.catchError)(err => {
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
      this.router.navigate(['/products']);
    });
  }
  static {
    this.ɵfac = function BulkCreateProductsComponent_Factory(t) {
      return new (t || BulkCreateProductsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_1__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__.ActivatedRoute), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_8__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__.Router));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: BulkCreateProductsComponent,
      selectors: [["app-bulk-create-products"]],
      decls: 33,
      vars: 6,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "float-sm-right"], ["href", "/assets/files/new_product.xlsx", "download", "product", 1, "btn", "btn-warning"], [1, "content"], ["class", "overlay-spinner", 4, "ngIf"], [1, "card"], [1, "card-body"], [1, "row"], [1, "col-md-6"], ["type", "hidden", "formControlName", "store_id", 3, "ngModel", "value", "ngModelChange"], [1, "w-100", 3, "formGroup"], ["appearance", "fill", 1, "w-100"], ["type", "text", "placeholder", "Select store", "aria-label", "Select store", "matInput", "", "formControlName", "store_name", 3, "matAutocomplete"], ["autoActiveFirstOption", ""], ["auto", "matAutocomplete"], [3, "value", "checked", "click", 4, "ngFor", "ngForOf"], ["type", "file", "accept", ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"], ["file", ""], [1, "col-12", "mt-3"], [1, "btn", "btn-primary", 3, "click"], [1, "overlay-spinner"], [3, "value", "click"]],
      template: function BulkCreateProductsComponent_Template(rf, ctx) {
        if (rf & 1) {
          const _r7 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](5, "Create Product (Bulk)");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 3)(7, "div", 4)(8, "a", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](9, "Download XLSX file");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](10, "section", 6);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](11, BulkCreateProductsComponent_div_11_Template, 2, 0, "div", 7);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](12, "form", 1)(13, "div", 8)(14, "div", 9)(15, "div", 10)(16, "div", 11)(17, "input", 12);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("ngModelChange", function BulkCreateProductsComponent_Template_input_ngModelChange_17_listener($event) {
            return ctx.storeId = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](18, "div", 13)(19, "mat-form-field", 14)(20, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](21, "Select store");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](22, "input", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](23, "mat-autocomplete", 16, 17);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](25, BulkCreateProductsComponent_mat_option_25_Template, 2, 4, "mat-option", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](26, "div", 11);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](27, "br")(28, "input", 19, 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](30, "div", 21)(31, "button", 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function BulkCreateProductsComponent_Template_button_click_31_listener() {
            _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r7);
            const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](29);
            return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx.createBulkProducts(_r3.files));
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](32, "Create Products");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵreference"](24);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](11);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx.isLoading);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngModel", ctx.storeId)("value", ctx.storeId);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("formGroup", ctx.storeForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](4);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("matAutocomplete", _r1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.stores);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_3__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.NgForm, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_3__.FormControlName, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_11__.MatInput, _angular_material_core__WEBPACK_IMPORTED_MODULE_12__.MatOption, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_13__.MatProgressSpinner, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocomplete, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocompleteTrigger],
      styles: ["\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 6309:
/*!***************************************************************************!*\
  !*** ./src/app/pages/products/createproducts/createproducts.component.ts ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CreateproductsComponent": () => (/* binding */ CreateproductsComponent)
/* harmony export */ });
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/cdk/drag-drop */ 7727);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 1989);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 9337);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/autocomplete */ 8550);















function CreateproductsComponent_mat_option_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-option", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_mat_option_23_Template_mat_option_click_0_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r10);
      const store_r8 = restoredCtx.$implicit;
      const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r9.changeStore(store_r8));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const store_r8 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("checked", store_r8.store_id == ctx_r1.storeId);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", store_r8.store_name);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", store_r8.store_name, " ");
  }
}
function CreateproductsComponent_div_25_mat_option_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-option", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const category_r14 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", category_r14.category_id);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](category_r14.category_name);
  }
}
function CreateproductsComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div")(1, "mat-form-field", 52)(2, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Product Category");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "mat-select", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](5, CreateproductsComponent_div_25_mat_option_5_Template, 2, 2, "mat-option", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const i_r12 = ctx.index;
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r12);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx_r2.storeCategories);
  }
}
function CreateproductsComponent_mat_option_58_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-option", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const qt_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", qt_r15.quantity_type_id);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](qt_r15.quantity_type_name);
  }
}
function CreateproductsComponent_div_87_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 10)(1, "mat-form-field", 22)(2, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Return within ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "(days)");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "input", 54);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}
function CreateproductsComponent_div_124_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 62);
  }
}
function CreateproductsComponent_div_124_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "input", 56)(2, "input", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, CreateproductsComponent_div_124_div_3_Template, 1, 0, "div", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](4, "img", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "input", 60);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("change", function CreateproductsComponent_div_124_Template_input_change_5_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r20);
      const i_r17 = restoredCtx.index;
      const ctx_r19 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r19.uploadImage($event, i_r17));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "button", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_div_124_Template_button_click_6_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r20);
      const i_r17 = restoredCtx.index;
      const ctx_r21 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r21.removeImage(i_r17));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](7, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const pi_r16 = ctx.$implicit;
    const i_r17 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", pi_r16.image_url);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", i_r17);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", pi_r16.dynamic_url, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
  }
}
function CreateproductsComponent_div_132_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 62);
  }
}
function CreateproductsComponent_div_132_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, CreateproductsComponent_div_132_div_1_Template, 1, 0, "div", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "input", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 26)(5, "div", 21)(6, "div", 10)(7, "mat-form-field", 22)(8, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Heading");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "input", 65);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "div", 10)(12, "mat-form-field", 22)(13, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, "Paragraph");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](15, "input", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "div", 67)(17, "button", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_div_132_Template_button_click_17_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r26);
      const i_r23 = restoredCtx.index;
      const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r25.removeContent(i_r23));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](18, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const i_r23 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r23);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", i_r23);
  }
}
function CreateproductsComponent_div_140_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 62);
  }
}
function CreateproductsComponent_div_140_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 63);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, CreateproductsComponent_div_140_div_1_Template, 1, 0, "div", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 64);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "input", 57);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "div", 26)(5, "div", 21)(6, "div", 10)(7, "mat-form-field", 22)(8, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, "Name");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](10, "input", 68);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](11, "div", 10)(12, "mat-form-field", 22)(13, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](14, "Link");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](15, "input", 69);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "div", 67)(17, "button", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_div_140_Template_button_click_17_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r31);
      const i_r28 = restoredCtx.index;
      const ctx_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r30.removeLink + i_r28);
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](18, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const i_r28 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r28);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", i_r28);
  }
}
const _c0 = function () {
  return [0];
};
class CreateproductsComponent {
  constructor(fb, api, toastr, router) {
    this.fb = fb;
    this.api = api;
    this.toastr = toastr;
    this.router = router;
    this.isLoading = false;
    this.productImages = [];
    this.productContents = [];
    this.productLinks = [];
    this.stores = [];
    this.storeCategories = [];
    this.quantityTypes = [];
    this.productForm = this.fb.group({
      store_id: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required],
      product: this.fb.group({
        quantity_type_id: ['1', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        quantity: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_featured_product: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        product_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        description: ['', []],
        product_price: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        selling_price: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        discount_type: ['percentage', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        discount_value: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_product_returnable: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        return_days_count: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        length: [0.0, []],
        width: [0.0, []],
        height: [0.0, []],
        weight: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_enabled: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
      }),
      product_categories: this.fb.array([this.fb.group({
        category_id: ['', []]
      })]),
      product_images: this.fb.array([]),
      product_contents: this.fb.array([]),
      product_links: this.fb.array([])
    });
    this.storeForm = this.fb.group({
      store_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    });
    this.storeForm.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_3__.debounceTime)(500), (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.tap)(() => {
      this.listStores(this.storeForm.value.store_name);
    })).subscribe();
    this.listStores(this.storeForm.value.store_name);
    this.listQuantityTypes();
  }
  ngOnInit() {}
  changeStore(store) {
    this.selectedStore = store;
    this.productForm.value.store_id = store.store_id;
    this.storeId = store.store_id;
    this.listCategories();
  }
  //images
  addImageTile() {
    const order = this.productImages.length + 1;
    this.productImages.push({
      image_url: '',
      dynamic_url: '',
      order
    });
    const fa = this.productForm.controls.product_images;
    fa.push(this.fb.group({
      image_url: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeImage(i) {
    this.productImages = this.productImages.filter((pi, index) => i != index);
    const fa = this.productForm.controls.product_images;
    fa.removeAt(i);
  }
  dropImage(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.moveItemInArray)(this.productImages, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productImages.length; i++) {
      const fa = this.productForm.controls.product_images;
      const fg = fa.controls.find(pi => pi.value.image_url == this.productImages[i].image_url);
      fg.setValue({
        image_url: this.productImages[i].image_url,
        order: i + 1
      });
    }
  }
  uploadImage(evt, index) {
    if (!evt.target.files[0]) {
      return;
    }
    const sub = this.api.uploadSingleFile(evt.target.files[0]).subscribe(response => {
      sub.unsubscribe();
      this.productImages[index].image_url = response.urls.orignal_url;
      this.productImages[index].dynamic_url = response.urls.dynamic_url;
      const fa = this.productForm.controls.product_images;
      fa.controls[index].setValue({
        image_url: this.productImages[index].image_url,
        order: this.productImages[index].order
      });
    });
  }
  addContentTile() {
    const order = this.productContents.length + 1;
    this.productContents.push({
      heading: '',
      paragraph: '',
      order: order
    });
    const fa = this.productForm.controls.product_contents;
    fa.push(this.fb.group({
      heading: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      paragraph: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeContent(i) {
    this.productContents = this.productContents.filter((pc, index) => i != index);
    const fa = this.productForm.controls.product_contents;
    fa.removeAt(i);
  }
  dropContent(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.moveItemInArray)(this.productContents, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productContents.length; i++) {
      const fa = this.productForm.controls.product_contents;
      const fg = fa.controls.find(pc => pc.value.heading == this.productContents[i].heading && pc.value.paragraph == this.productContents[i].paragraph);
      fg.setValue({
        heading: this.productContents[i].heading,
        paragraph: this.productContents[i].paragraph,
        order: i + 1
      });
    }
  }
  addLinkTile() {
    const order = this.productLinks.length + 1;
    this.productLinks.push({
      name: '',
      link: '',
      order
    });
    const fa = this.productForm.controls.product_links;
    fa.push(this.fb.group({
      name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      link: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeLink(i) {
    this.productLinks = this.productLinks.filter((pl, index) => i != index);
    const fa = this.productForm.controls.product_links;
    fa.removeAt(i);
  }
  dropLink(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.moveItemInArray)(this.productLinks, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productLinks.length; i++) {
      const fa = this.productForm.controls.product_links;
      const fg = fa.controls.find(pc => pc.value.name == this.productLinks[i].name && pc.value.link == this.productLinks[i].link);
      fg.setValue({
        name: this.productLinks[i].name,
        link: this.productLinks[i].link,
        order: i + 1
      });
    }
  }
  listStores(q) {
    const sub = this.api.listStores(q, 1, 100, 'store_id', 'DESC').subscribe(response => {
      sub.unsubscribe();
      this.stores = response.stores.map(({
        store_name,
        store_id
      }) => {
        return {
          store_name,
          store_id
        };
      });
    });
  }
  listCategories() {
    const sub = this.api.categoryList('', 1, 100, "category_id", "DESC", [{
      store_id: this.productForm.value.store_id
    }]).subscribe(response => {
      sub.unsubscribe();
      this.storeCategories = response.categories.map(({
        category_id,
        category_name
      }) => {
        return {
          category_id,
          category_name
        };
      });
    });
  }
  listQuantityTypes() {
    const sub = this.api.listQuantityTypes().subscribe(response => {
      sub.unsubscribe();
      this.quantityTypes = response.quantity_types.map(({
        quantity_type_id,
        quantity_type_name
      }) => {
        return {
          quantity_type_id,
          quantity_type_name
        };
      });
    });
  }
  createProduct() {
    if (this.productForm.invalid) {
      return alert("Please fill all mandatory fields");
    }
    const productCategories = this.productForm.value.product_categories[0].category_id ? this.productForm.value.product_categories : [];
    const values = this.productForm.value;
    if (values.product.product_price <= 0) {
      return alert("Product price must not be less than or equals to 0");
    }
    const sub = this.api.createProduct(values.store_id, {
      ...values.product,
      selling_price: values.product.product_price
    }, productCategories, values.product_images, values.product_contents, values.product_links).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_6__.catchError)(err => {
      return err;
    })).subscribe(response => {
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/products']);
    });
  }
  deleteProduct() {
    const sub = this.api.deleteProduct(this.storeId, this.product_id).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_6__.catchError)(err => {
      return err;
    })).subscribe(response => {
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/products']);
    });
  }
  static {
    this.ɵfac = function CreateproductsComponent_Factory(t) {
      return new (t || CreateproductsComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_7__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_8__.Router));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: CreateproductsComponent,
      selectors: [["app-createproducts"]],
      decls: 144,
      vars: 19,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "col-sm-6", "d-flex"], [1, "btn", "btn-danger", "ml-auto", 3, "click"], [1, "content"], [1, "card"], [1, "card-body"], [1, "row", 3, "formGroup"], [1, "col-md-6"], ["type", "hidden", "formControlName", "store_id", 3, "ngModel", "value", "ngModelChange"], [3, "formGroup"], ["appearance", "fill", 1, "w-100"], ["type", "text", "placeholder", "Select store", "aria-label", "Select store", "matInput", "", "formControlName", "store_name", 3, "matAutocomplete"], ["autoActiveFirstOption", ""], ["auto", "matAutocomplete"], [3, "value", "checked", "click", 4, "ngFor", "ngForOf"], ["formArrayName", "product_categories", 1, "col-md-6"], [4, "ngFor", "ngForOf"], ["formGroupName", "product", 1, "col-12"], [1, "row"], [1, "w-100"], ["type", "text", "matInput", "", "formControlName", "product_name"], ["formControlName", "is_enabled"], [3, "value"], [1, "col-12"], ["matInput", "", "placeholder", "Description", "formControlName", "description"], ["type", "number", "matInput", "", "formControlName", "product_price"], ["formControlName", "quantity_type_id"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", "matInput", "", "formControlName", "quantity"], ["formControlName", "discount_type"], ["type", "number", "matInput", "", "formControlName", "discount_value"], ["formControlName", "is_product_returnable"], ["class", "col-md-6", 4, "ngIf"], ["type", "number", "matInput", "", "formControlName", "length"], ["type", "number", "matInput", "", "formControlName", "width"], ["type", "number", "matInput", "", "formControlName", "height"], ["type", "number", "matInput", "", "formControlName", "weight"], ["formArrayName", "product_images", 1, "col-12"], [1, "d-flex", "justify-content-between", "w-100", "mb-3"], [1, "btn", "btn-warning", 3, "click"], ["cdkDropList", "", 1, "example-list", "w-100", 3, "cdkDropListDropped"], ["class", "example-box", "cdkDrag", "", 3, "formGroupName", 4, "ngFor", "ngForOf"], ["formArrayName", "product_contents", 1, "col-12"], [1, "d-flex", "justify-content-between", "w-100", "mt-4", "mb-3"], ["class", "example-box", "cdkDrag", "", 4, "ngFor", "ngForOf"], ["formArrayName", "product_links", 1, "col-12"], [1, "col-12", "mt-4"], [1, "btn", "btn-primary", 3, "click"], [3, "value", "click"], ["appearance", "fill", 1, "w-100", 3, "formGroupName"], ["formControlName", "category_id"], ["type", "number", "matInput", "", "formControlName", "return_days_count"], ["cdkDrag", "", 1, "example-box", 3, "formGroupName"], ["type", "hidden", "formControlName", "image_url", 3, "value"], ["type", "hidden", "formControlName", "order", 3, "value"], ["class", "example-custom-placeholder", 4, "cdkDragPlaceholder"], ["alt", "", "width", "100", "height", "auto", 3, "src"], ["type", "file", 1, "ml-3", 3, "change"], [1, "btn", "btn-danger", "ml-auto", "mr-2", 3, "click"], [1, "example-custom-placeholder"], ["cdkDrag", "", 1, "example-box"], [1, "flex-grow-1", 3, "formGroupName"], ["type", "text", "matInput", "", "formControlName", "heading"], ["type", "text", "matInput", "", "formControlName", "paragraph"], [1, "align-self-start", "mt-2"], ["type", "text", "matInput", "", "formControlName", "name"], ["type", "text", "matInput", "", "formControlName", "link"]],
      template: function CreateproductsComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Create Product");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 4)(7, "button", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_Template_button_click_7_listener() {
            return ctx.deleteProduct();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "Delete Product");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "section", 6)(10, "div", 1)(11, "div", 7)(12, "div", 8)(13, "form", 9)(14, "div", 10)(15, "input", 11);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function CreateproductsComponent_Template_input_ngModelChange_15_listener($event) {
            return ctx.storeId = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](16, "div", 12)(17, "mat-form-field", 13)(18, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](19, "Select store");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](20, "input", 14);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "mat-autocomplete", 15, 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](23, CreateproductsComponent_mat_option_23_Template, 2, 4, "mat-option", 17);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "div", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](25, CreateproductsComponent_div_25_Template, 6, 2, "div", 19);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](26, "div", 20)(27, "div", 21)(28, "div", 10)(29, "mat-form-field", 22)(30, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](31, "Product Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](32, "input", 23);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](33, "div", 10)(34, "mat-form-field", 13)(35, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](36, "Status");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](37, "mat-select", 24)(38, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](39, "Enabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](40, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](41, "Disabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](42, "div", 26)(43, "mat-form-field", 22)(44, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](45, "Description");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](46, "textarea", 27);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](47, "div", 10)(48, "mat-form-field", 22)(49, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](50, "Price per unit");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](51, "input", 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](52, "div", 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](53, "div", 10)(54, "mat-form-field", 13)(55, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](56, "Quantity Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](57, "mat-select", 29);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](58, CreateproductsComponent_mat_option_58_Template, 2, 2, "mat-option", 30);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](59, "div", 10)(60, "mat-form-field", 22)(61, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](62, "Quantity");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](63, "input", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](64, "div", 10)(65, "mat-form-field", 13)(66, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](67, "Discount Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](68, "mat-select", 32)(69, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](70, "Percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](71, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](72, "Amount");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](73, "div", 10)(74, "mat-form-field", 22)(75, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](76, "Discount value");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](77, "input", 33);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](78, "div", 10)(79, "mat-form-field", 13)(80, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](81, "Allow return");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](82, "mat-select", 34)(83, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](84, "True");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](85, "mat-option", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](86, "False");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](87, CreateproductsComponent_div_87_Template, 7, 0, "div", 35);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](88, "div", 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](89, "div", 10)(90, "mat-form-field", 22)(91, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](92, "Length ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](93, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](94, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](95, "input", 36);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](96, "div", 10)(97, "mat-form-field", 22)(98, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](99, "Bredth ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](100, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](101, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](102, "input", 37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](103, "div", 10)(104, "mat-form-field", 22)(105, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](106, "Height ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](107, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](108, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](109, "input", 38);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](110, "div", 10)(111, "mat-form-field", 22)(112, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](113, "Weight ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](114, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](115, "(oz)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](116, "input", 39);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](117, "div", 40)(118, "div", 41)(119, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](120, "Product Images");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](121, "button", 42);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_Template_button_click_121_listener() {
            return ctx.addImageTile();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](122, "Add Image");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](123, "div", 43);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function CreateproductsComponent_Template_div_cdkDropListDropped_123_listener($event) {
            return ctx.dropImage($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](124, CreateproductsComponent_div_124_Template, 8, 4, "div", 44);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](125, "div", 45)(126, "div", 46)(127, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](128, "Contents and strains");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](129, "button", 42);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_Template_button_click_129_listener() {
            return ctx.addContentTile();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](130, "Add Content");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](131, "div", 43);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function CreateproductsComponent_Template_div_cdkDropListDropped_131_listener($event) {
            return ctx.dropContent($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](132, CreateproductsComponent_div_132_Template, 19, 2, "div", 47);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](133, "div", 48)(134, "div", 46)(135, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](136, "Links");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](137, "button", 42);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_Template_button_click_137_listener() {
            return ctx.addLinkTile();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](138, "Add link");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](139, "div", 43);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function CreateproductsComponent_Template_div_cdkDropListDropped_139_listener($event) {
            return ctx.dropLink($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](140, CreateproductsComponent_div_140_Template, 19, 2, "div", 47);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](141, "div", 49)(142, "button", 50);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CreateproductsComponent_Template_button_click_142_listener() {
            return ctx.createProduct();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](143, " Create product ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          const _r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](13);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.productForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx.storeId)("value", ctx.storeId);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.storeForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matAutocomplete", _r0);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.stores);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction0"](18, _c0));
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](13);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", true);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", false);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](18);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.quantityTypes);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](11);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", "percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", "amount");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](12);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", true);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", false);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.productForm == null ? null : ctx.productForm.value == null ? null : ctx.productForm.value.product == null ? null : ctx.productForm.value.product.is_product_returnable);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productImages);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productContents);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productLinks);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormGroupName, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormArrayName, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_11__.MatInput, _angular_material_select__WEBPACK_IMPORTED_MODULE_12__.MatSelect, _angular_material_core__WEBPACK_IMPORTED_MODULE_13__.MatOption, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocomplete, _angular_material_autocomplete__WEBPACK_IMPORTED_MODULE_14__.MatAutocompleteTrigger, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.CdkDropList, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.CdkDrag, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_5__.CdkDragPlaceholder],
      styles: [".example-list[_ngcontent-%COMP%] {\n  width: 500px;\n  max-width: 100%;\n  border: solid 1px #ccc;\n  min-height: 60px;\n  display: block;\n  background: white;\n  border-radius: 4px;\n  overflow: hidden;\n}\n\n.example-box[_ngcontent-%COMP%] {\n  padding: 20px 10px;\n  border-bottom: solid 1px #ccc;\n  color: rgba(0, 0, 0, 0.87);\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-between;\n  box-sizing: border-box;\n  cursor: move;\n  background: white;\n  font-size: 14px;\n}\n\n.cdk-drag-preview[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  border-radius: 4px;\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n}\n\n.cdk-drag-animating[_ngcontent-%COMP%] {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.example-box[_ngcontent-%COMP%]:last-child {\n  border: none;\n}\n\n.example-list.cdk-drop-list-dragging[_ngcontent-%COMP%]   .example-box[_ngcontent-%COMP%]:not(.cdk-drag-placeholder) {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.example-custom-placeholder[_ngcontent-%COMP%] {\n  background: #ccc;\n  border: dotted 3px #999;\n  min-height: 60px;\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n/*# sourceURL=webpack://./src/app/pages/products/createproducts/createproducts.component.scss */\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvcGFnZXMvcHJvZHVjdHMvY3JlYXRlcHJvZHVjdHMvY3JlYXRlcHJvZHVjdHMuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDSSxZQUFBO0VBQ0EsZUFBQTtFQUNBLHNCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0FBQ0o7O0FBRUU7RUFDRSxrQkFBQTtFQUNBLDZCQUFBO0VBQ0EsMEJBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLDhCQUFBO0VBQ0Esc0JBQUE7RUFDQSxZQUFBO0VBQ0EsaUJBQUE7RUFDQSxlQUFBO0FBQ0o7O0FBRUU7RUFDRSxzQkFBQTtFQUNBLGtCQUFBO0VBQ0EscUhBQUE7QUFDSjs7QUFJRTtFQUNFLHNEQUFBO0FBREo7O0FBSUU7RUFDRSxZQUFBO0FBREo7O0FBSUU7RUFDRSxzREFBQTtBQURKOztBQUlFO0VBQ0UsZ0JBQUE7RUFDQSx1QkFBQTtFQUNBLGdCQUFBO0VBQ0Esc0RBQUE7QUFESiIsInNvdXJjZXNDb250ZW50IjpbIi5leGFtcGxlLWxpc3Qge1xuICB3aWR0aDogNTAwcHg7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgYm9yZGVyOiBzb2xpZCAxcHggI2NjYztcbiAgbWluLWhlaWdodDogNjBweDtcbiAgZGlzcGxheTogYmxvY2s7XG4gIGJhY2tncm91bmQ6IHdoaXRlO1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG59XG5cbi5leGFtcGxlLWJveCB7XG4gIHBhZGRpbmc6IDIwcHggMTBweDtcbiAgYm9yZGVyLWJvdHRvbTogc29saWQgMXB4ICNjY2M7XG4gIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODcpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGN1cnNvcjogbW92ZTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG4gIGZvbnQtc2l6ZTogMTRweDtcbn1cblxuLmNkay1kcmFnLXByZXZpZXcge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBib3JkZXItcmFkaXVzOiA0cHg7XG4gIGJveC1zaGFkb3c6IDAgNXB4IDVweCAtM3B4IHJnYmEoMCwgMCwgMCwgMC4yKSwgMCA4cHggMTBweCAxcHggcmdiYSgwLCAwLCAwLCAwLjE0KSwgMCAzcHggMTRweCAycHggcmdiYSgwLCAwLCAwLCAwLjEyKTtcbn1cblxuLmNkay1kcmFnLWFuaW1hdGluZyB7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAyNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKTtcbn1cblxuLmV4YW1wbGUtYm94Omxhc3QtY2hpbGQge1xuICBib3JkZXI6IG5vbmU7XG59XG5cbi5leGFtcGxlLWxpc3QuY2RrLWRyb3AtbGlzdC1kcmFnZ2luZyAuZXhhbXBsZS1ib3g6bm90KC5jZGstZHJhZy1wbGFjZWhvbGRlcikge1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMjUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XG59XG5cbi5leGFtcGxlLWN1c3RvbS1wbGFjZWhvbGRlciB7XG4gIGJhY2tncm91bmQ6ICNjY2M7XG4gIGJvcmRlcjogZG90dGVkIDNweCAjOTk5O1xuICBtaW4taGVpZ2h0OiA2MHB4O1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMjUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XG59Il0sInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 7339:
/*!***********************************************************************!*\
  !*** ./src/app/pages/products/edit-product/edit-product.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EditProductComponent": () => (/* binding */ EditProductComponent)
/* harmony export */ });
/* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/cdk/drag-drop */ 7727);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ 2508);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 3158);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 2560);
/* harmony import */ var _services_api_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @services/api.service */ 5830);
/* harmony import */ var ngx_toastr__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ngx-toastr */ 4817);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common */ 4666);
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/form-field */ 5074);
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/input */ 8562);
/* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/select */ 7371);
/* harmony import */ var _angular_material_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/core */ 9121);
/* harmony import */ var _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/progress-spinner */ 1708);















function EditProductComponent_div_13_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function EditProductComponent_mat_option_26_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-option", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const category_r7 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", category_r7.category_id);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](category_r7.category_name);
  }
}
function EditProductComponent_mat_option_58_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "mat-option", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const qt_r8 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", qt_r8.quantity_type_id);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](qt_r8.quantity_type_name);
  }
}
function EditProductComponent_div_87_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 11)(1, "mat-form-field", 18)(2, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "Return within ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "small");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "(days)");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](6, "input", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
}
function EditProductComponent_div_124_div_2_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 54);
  }
}
const _c0 = function (a0) {
  return {
    "d-none": a0
  };
};
function EditProductComponent_div_124_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "input", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](2, EditProductComponent_div_124_div_2_Template, 1, 0, "div", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](3, "img", 51);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "input", 52);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("change", function EditProductComponent_div_124_Template_input_change_4_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r13);
      const i_r10 = restoredCtx.index;
      const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r12.uploadImage($event, i_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "button", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_div_124_Template_button_click_5_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r13);
      const i_r10 = restoredCtx.index;
      const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r14.removeImage(i_r10));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const pi_r9 = ctx.$implicit;
    const i_r10 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r10);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](4, _c0, pi_r9.status == "deleted"));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", pi_r9.image_url);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("src", pi_r9.dynamic_url, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsanitizeUrl"]);
  }
}
function EditProductComponent_div_132_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 54);
  }
}
function EditProductComponent_div_132_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, EditProductComponent_div_132_div_1_Template, 1, 0, "div", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 56)(3, "div", 22)(4, "div", 57)(5, "div", 11)(6, "mat-form-field", 18)(7, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "Heading");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](9, "input", 58);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 11)(11, "mat-form-field", 18)(12, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](13, "Paragraph");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](14, "input", 59);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](15, "div", 60)(16, "button", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_div_132_Template_button_click_16_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r19);
      const i_r16 = restoredCtx.index;
      const ctx_r18 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r18.removeContent(i_r16));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const pc_r15 = ctx.$implicit;
    const i_r16 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](2, _c0, pc_r15.status == "deleted"));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r16);
  }
}
function EditProductComponent_div_140_div_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "div", 54);
  }
}
function EditProductComponent_div_140_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 55);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](1, EditProductComponent_div_140_div_1_Template, 1, 0, "div", 50);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](2, "div", 56)(3, "div", 22)(4, "div", 57)(5, "div", 11)(6, "mat-form-field", 18)(7, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "Name");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](9, "input", 61);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 11)(11, "mat-form-field", 18)(12, "mat-label");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](13, "Link");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](14, "input", 62);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](15, "div", 60)(16, "button", 53);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_div_140_Template_button_click_16_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r24);
      const i_r21 = restoredCtx.index;
      const ctx_r23 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r23.removeLink(i_r21));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](17, "X");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const pl_r20 = ctx.$implicit;
    const i_r21 = ctx.index;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction1"](2, _c0, pl_r20.status == "deleted"));
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpropertyInterpolate"]("formGroupName", i_r21);
  }
}
class EditProductComponent {
  constructor(fb, api, toastr, router, route) {
    this.fb = fb;
    this.api = api;
    this.toastr = toastr;
    this.router = router;
    this.route = route;
    this.isLoading = true;
    this.productImages = [];
    this.productContents = [];
    this.productLinks = [];
    this.storeCategories = [];
    this.productCategories = [];
    this.quantityTypes = [];
    this.productForm = this.fb.group({
      store_id: ['', _angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required],
      product: this.fb.group({
        product_id: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        quantity_type_id: ['1', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        quantity: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_featured_product: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        product_name: ['', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        description: ['', []],
        product_price: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        selling_price: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        discount_type: ['percentage', [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        discount_value: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_product_returnable: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        return_days_count: [0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        length: [0.0, []],
        width: [0.0, []],
        height: [0.0, []],
        weight: [0.0, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
        is_enabled: [false, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
      }),
      product_categories: [[]],
      product_images: this.fb.array([]),
      product_contents: this.fb.array([]),
      product_links: this.fb.array([])
    });
    this.listQuantityTypes();
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.storeId = params.get('store_id');
      this.productId = params.get('product_id');
      this.getProductDetails(params.get('product_id'), this.storeId);
      this.getStoreDetails(this.storeId);
      this.listCategories();
    });
  }
  getProductDetails(product_id, store_id) {
    const sub = this.api.productDetails(store_id, product_id).subscribe(response => {
      this.isLoading = false;
      sub.unsubscribe();
      const product = response.product;
      //store
      //store
      //store
      //store
      this.productForm.controls.store_id.setValue(product.store_id);
      //product
      //product
      //product
      //product
      this.productForm.controls.product.setValue({
        product_id: product.product_id,
        quantity_type_id: product.quantity_type_id,
        quantity: product.quantity,
        is_featured_product: product.is_featured_product,
        product_name: product.product_name,
        description: product.description,
        product_price: product.product_price,
        selling_price: product.selling_price,
        discount_type: product.discount_type,
        discount_value: product.discount_value,
        is_product_returnable: product.is_product_returnable,
        return_days_count: product.return_days_count,
        length: product.length,
        width: product.width,
        height: product.height,
        weight: product.weight,
        is_enabled: product.is_enabled
      });
      //product category
      //product category
      //product category
      //product category
      if (product.product_categories.length) {
        this.productCategories = product.product_categories;
        this.productForm.controls.product_categories.setValue(this.productCategories.map(pc => pc.category.category_id));
      }
      //product images
      //product images
      //product images
      //product images
      const productImages = product.product_images.map(pi => {
        return {
          product_image_id: pi.product_image_id,
          order: pi.order,
          status: pi.status,
          image_url: pi.image.orignal_url,
          dynamic_url: pi.image.dynamic_url
        };
      });
      productImages.forEach(pi => {
        this.addImageTile(pi.product_image_id, pi.status, pi.image_url, pi.dynamic_url, pi.order);
      });
      //product content
      //product content
      //product content
      //product content
      const productContents = product.product_contents.map(pi => {
        return {
          product_content_id: pi.product_content_id,
          heading: pi.heading,
          paragraph: pi.paragraph,
          order: pi.order,
          status: pi.status
        };
      });
      productContents.forEach(pi => {
        this.addContentTile(pi.product_content_id, pi.status, pi.heading, pi.paragraph, pi.order);
      });
      //product link
      //product link
      //product link
      //product link
      const productLinks = product.product_links.map(pl => {
        return {
          product_link_id: pl.product_link_id,
          name: pl.name,
          link: pl.link,
          order: pl.order,
          status: pl.status
        };
      });
      productLinks.forEach(pl => {
        this.addLinkTile(pl.product_link_id, pl.status, pl.name, pl.link, pl.order);
      });
    });
  }
  getStoreDetails(store_id) {
    const sub = this.api.getStoreDetails(store_id).subscribe(response => {
      sub.unsubscribe();
      this.selectedStore = {
        store_id,
        store_name: response.store.store_name
      };
    });
  }
  //images
  addImageTile(product_image_id, status, image_url, dynamic_url, order) {
    order = order ? order : this.productImages.length + 1;
    this.productImages.push({
      product_image_id,
      status,
      image_url,
      dynamic_url,
      order
    });
    const fa = this.productForm.controls.product_images;
    fa.push(this.fb.group({
      product_image_id: [product_image_id, []],
      image_url: [image_url, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      status: [status, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeImage(i) {
    this.productImages[i].status = 'deleted';
    const fa = this.productForm.controls.product_images;
    fa.controls[i].setValue({
      ...fa.controls[i].value,
      status: 'deleted'
    });
  }
  dropImage(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.moveItemInArray)(this.productImages, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productImages.length; i++) {
      const fa = this.productForm.controls.product_images;
      const fg = fa.controls.find(pi => pi.value.image_url == this.productImages[i].image_url);
      fg.setValue({
        ...fg.value,
        order: i + 1
      });
    }
  }
  uploadImage(evt, index) {
    if (!evt.target.files[0]) {
      return;
    }
    this.isLoading = true;
    const sub = this.api.uploadSingleFile(evt.target.files[0]).subscribe(response => {
      sub.unsubscribe();
      this.productImages[index].image_url = response.urls.orignal_url;
      this.productImages[index].dynamic_url = response.urls.dynamic_url;
      const fa = this.productForm.controls.product_images;
      fa.controls[index].setValue({
        product_image_id: this.productImages[index].product_image_id,
        status: this.productImages[index].status,
        image_url: this.productImages[index].image_url,
        order: this.productImages[index].order
      });
      this.isLoading = false;
    });
  }
  addContentTile(product_content_id, status, heading, paragraph, order) {
    order = order ? order : this.productContents.length + 1;
    this.productContents.push({
      product_content_id,
      status,
      heading,
      paragraph,
      order
    });
    const fa = this.productForm.controls.product_contents;
    fa.push(this.fb.group({
      product_content_id: [product_content_id, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      status: [status, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      heading: [heading, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      paragraph: [paragraph, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeContent(i) {
    this.productContents[i].status = 'deleted';
    const fa = this.productForm.controls.product_contents;
    fa.controls[i].setValue({
      ...fa.controls[i].value,
      status: 'deleted'
    });
  }
  dropContent(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.moveItemInArray)(this.productContents, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productContents.length; i++) {
      const fa = this.productForm.controls.product_contents;
      const fg = fa.controls.find(pc => pc.value.heading == this.productContents[i].heading && pc.value.paragraph == this.productContents[i].paragraph && pc.value.product_content_id == this.productContents[i].product_content_id);
      fg.setValue({
        product_content_id: this.productContents[i].product_content_id,
        status: this.productContents[i].status,
        heading: this.productContents[i].heading,
        paragraph: this.productContents[i].paragraph,
        order: i + 1
      });
    }
  }
  addLinkTile(product_link_id, status, name, link, order) {
    order = order ? order : this.productLinks.length + 1;
    this.productLinks.push({
      product_link_id,
      status,
      name,
      link,
      order
    });
    const fa = this.productForm.controls.product_links;
    fa.push(this.fb.group({
      product_link_id: [product_link_id, []],
      name: [name, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      link: [link, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      order: [order, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]],
      status: [status, [_angular_forms__WEBPACK_IMPORTED_MODULE_2__.Validators.required]]
    }));
  }
  removeLink(i) {
    this.productLinks[i].status = 'deleted';
    const fa = this.productForm.controls.product_links;
    fa.controls[i].setValue({
      ...fa.controls[i].value,
      status: 'deleted'
    });
  }
  dropLink(event) {
    (0,_angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.moveItemInArray)(this.productLinks, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.productLinks.length; i++) {
      const fa = this.productForm.controls.product_links;
      const fg = fa.controls.find(pc => pc.value.name == this.productLinks[i].name && pc.value.link == this.productLinks[i].link);
      fg.setValue({
        ...this.productLinks[i],
        order: i + 1
      });
    }
  }
  listCategories() {
    const sub = this.api.categoryList('', 1, 100, "category_id", "DESC", [{
      store_id: this.storeId
    }]).subscribe(response => {
      sub.unsubscribe();
      this.storeCategories = response.categories.map(({
        category_id,
        category_name
      }) => {
        return {
          category_id,
          category_name
        };
      });
    });
  }
  listQuantityTypes() {
    const sub = this.api.listQuantityTypes().subscribe(response => {
      sub.unsubscribe();
      this.quantityTypes = response.quantity_types.map(({
        quantity_type_id,
        quantity_type_name
      }) => {
        return {
          quantity_type_id,
          quantity_type_name
        };
      });
    });
  }
  updateProduct() {
    if (this.productForm.invalid) {
      return alert("Please fill all mandatory fields");
    }
    this.isLoading = true;
    const productCategories = [];
    this.productForm.value.product_categories.forEach(category_id => {
      const productCategory = this.productCategories.find(pc => {
        return pc.category.category_id == category_id;
      });
      if (productCategory) {
        productCategories.push(productCategory);
      } else {
        productCategories.push({
          product_category_id: null,
          status: 'active',
          category: {
            category_id
          }
        });
      }
    });
    this.productCategories.forEach(pc => {
      const productCategory = productCategories.find(p => {
        return p.category.category_id == pc.category.category_id;
      });
      if (!productCategory) {
        productCategories.push({
          ...pc,
          status: 'deleted'
        });
      }
    });
    const values = this.productForm.value;
    let lastImageIndex = 0;
    const productImages = values.product_images.map(pi => {
      if (pi.status == 'active') {
        return {
          ...pi,
          order: ++lastImageIndex
        };
      }
      return pi;
    });
    let lastContentIndex = 0;
    const productContents = values.product_contents.map(pc => {
      if (pc.status == 'active') {
        return {
          ...pc,
          order: ++lastContentIndex
        };
      }
      return pc;
    });
    let lastLinkIndex = 0;
    const productLinks = values.product_links.map(pl => {
      if (pl.status == 'active') {
        return {
          ...pl,
          order: ++lastLinkIndex
        };
      }
      return pl;
    });
    const sub = this.api.updateProduct(values.store_id, {
      ...values.product,
      selling_price: values.product.product_price
    }, productCategories, productImages, productContents, productLinks).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.catchError)(err => {
      return err;
    })).subscribe(response => {
      this.isLoading = false;
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/products']);
    });
  }
  deleteProduct() {
    const sub = this.api.deleteProduct(this.storeId, this.productId).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.catchError)(err => {
      return err;
    })).subscribe(response => {
      sub.unsubscribe();
      if (response?.status >= 400) {
        this.toastr.error(response.error.message);
        return;
      }
      this.toastr.success(response.message);
      this.router.navigate(['/products']);
    });
  }
  static {
    this.ɵfac = function EditProductComponent_Factory(t) {
      return new (t || EditProductComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](ngx_toastr__WEBPACK_IMPORTED_MODULE_5__.ToastrService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.Router), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_6__.ActivatedRoute));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: EditProductComponent,
      selectors: [["app-edit-product"]],
      decls: 144,
      vars: 15,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-6"], [1, "col-6", "d-flex", "justify-content-end"], [1, "btn", "btn-danger", 3, "click"], [1, "content"], [1, "card"], [1, "card-body"], ["class", "overlay-spinner", 4, "ngIf"], [1, "row", 3, "formGroup"], [1, "col-md-6"], ["type", "hidden", "formControlName", "store_id"], ["appearance", "fill", 1, "w-100"], ["type", "text", "placeholder", "Store", "matInput", "", "disabled", "", 3, "value"], ["multiple", "", "formControlName", "product_categories"], [3, "value", 4, "ngFor", "ngForOf"], ["formGroupName", "product", 1, "row"], [1, "w-100"], ["type", "text", "matInput", "", "formControlName", "product_name"], ["formControlName", "is_enabled"], [3, "value"], [1, "col-12"], ["matInput", "", "placeholder", "Description", "formControlName", "description"], ["type", "number", "matInput", "", "formControlName", "product_price"], ["formControlName", "quantity_type_id"], ["type", "number", "matInput", "", "formControlName", "quantity"], ["formControlName", "discount_type"], ["type", "number", "matInput", "", "formControlName", "discount_value"], ["formControlName", "is_product_returnable"], ["class", "col-md-6", 4, "ngIf"], ["type", "number", "matInput", "", "formControlName", "length"], ["type", "number", "matInput", "", "formControlName", "width"], ["type", "number", "matInput", "", "formControlName", "height"], ["type", "number", "matInput", "", "formControlName", "weight"], ["formArrayName", "product_images", 1, "col-12"], [1, "d-flex", "justify-content-between", "w-100", "mb-3"], [1, "btn", "btn-warning", 3, "click"], ["cdkDropList", "", 1, "example-list", "w-100", 3, "cdkDropListDropped"], ["class", "example-box", "cdkDrag", "", 3, "formGroupName", "ngClass", 4, "ngFor", "ngForOf"], ["formArrayName", "product_contents", 1, "col-12"], [1, "d-flex", "justify-content-between", "w-100", "mt-4", "mb-3"], ["class", "example-box", "cdkDrag", "", 3, "ngClass", 4, "ngFor", "ngForOf"], ["formArrayName", "product_links", 1, "col-12"], [1, "col-12", "mt-4"], [1, "btn", "btn-primary", 3, "click"], [1, "overlay-spinner"], ["type", "number", "matInput", "", "formControlName", "return_days_count"], ["cdkDrag", "", 1, "example-box", 3, "formGroupName", "ngClass"], ["type", "hidden", "formControlName", "image_url", 3, "value"], ["class", "example-custom-placeholder", 4, "cdkDragPlaceholder"], ["alt", "", "width", "100", "height", "auto", 3, "src"], ["type", "file", 1, "ml-3", 3, "change"], [1, "btn", "btn-danger", "ml-auto", "mr-2", 3, "click"], [1, "example-custom-placeholder"], ["cdkDrag", "", 1, "example-box", 3, "ngClass"], [1, "flex-grow-1", 3, "formGroupName"], [1, "row"], ["type", "text", "matInput", "", "formControlName", "heading"], ["type", "text", "matInput", "", "formControlName", "paragraph"], [1, "align-self-start", "mt-2"], ["type", "text", "matInput", "", "formControlName", "name"], ["type", "text", "matInput", "", "formControlName", "link"]],
      template: function EditProductComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Update product");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 4)(7, "button", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_Template_button_click_7_listener() {
            return ctx.deleteProduct();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "Delete product");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "section", 6)(10, "div", 1)(11, "div", 7)(12, "div", 8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](13, EditProductComponent_div_13_Template, 2, 0, "div", 9);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "form", 10)(15, "div", 11);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](16, "input", 12);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](17, "mat-form-field", 13)(18, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](19, "Store");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](20, "input", 14);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "div", 11)(22, "mat-form-field", 13)(23, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](24, "Product Category");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](25, "mat-select", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](26, EditProductComponent_mat_option_26_Template, 2, 2, "mat-option", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](27, "div", 17)(28, "div", 11)(29, "mat-form-field", 18)(30, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](31, "Product Name");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](32, "input", 19);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](33, "div", 11)(34, "mat-form-field", 13)(35, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](36, "Status");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](37, "mat-select", 20)(38, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](39, "Enabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](40, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](41, "Disabled");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](42, "div", 22)(43, "mat-form-field", 18)(44, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](45, "Description");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](46, "textarea", 23);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](47, "div", 11)(48, "mat-form-field", 18)(49, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](50, "Price per unit");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](51, "input", 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](52, "div", 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](53, "div", 11)(54, "mat-form-field", 13)(55, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](56, "Quantity Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](57, "mat-select", 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](58, EditProductComponent_mat_option_58_Template, 2, 2, "mat-option", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](59, "div", 11)(60, "mat-form-field", 18)(61, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](62, "Quantity");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](63, "input", 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](64, "div", 11)(65, "mat-form-field", 13)(66, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](67, "Discount Type");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](68, "mat-select", 27)(69, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](70, "Percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](71, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](72, "Amount");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](73, "div", 11)(74, "mat-form-field", 18)(75, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](76, "Discount value");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](77, "input", 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](78, "div", 11)(79, "mat-form-field", 13)(80, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](81, "Allow return");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](82, "mat-select", 29)(83, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](84, "True");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](85, "mat-option", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](86, "False");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](87, EditProductComponent_div_87_Template, 7, 0, "div", 30);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](88, "div", 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](89, "div", 11)(90, "mat-form-field", 18)(91, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](92, "Length");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](93, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](94, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](95, "input", 31);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](96, "div", 11)(97, "mat-form-field", 18)(98, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](99, "Bredth ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](100, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](101, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](102, "input", 32);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](103, "div", 11)(104, "mat-form-field", 18)(105, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](106, "Height ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](107, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](108, "(in)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](109, "input", 33);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](110, "div", 11)(111, "mat-form-field", 18)(112, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](113, "Weight ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](114, "small");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](115, "(oz)");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](116, "input", 34);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](117, "div", 35)(118, "div", 36)(119, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](120, "Product Images");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](121, "button", 37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_Template_button_click_121_listener() {
            return ctx.addImageTile(null, "active", "", "");
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](122, "Add Image");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](123, "div", 38);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function EditProductComponent_Template_div_cdkDropListDropped_123_listener($event) {
            return ctx.dropImage($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](124, EditProductComponent_div_124_Template, 7, 6, "div", 39);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](125, "div", 40)(126, "div", 41)(127, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](128, "Contents and strains");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](129, "button", 37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_Template_button_click_129_listener() {
            return ctx.addContentTile(null, "active", "", "");
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](130, "Add Content");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](131, "div", 38);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function EditProductComponent_Template_div_cdkDropListDropped_131_listener($event) {
            return ctx.dropContent($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](132, EditProductComponent_div_132_Template, 18, 4, "div", 42);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](133, "div", 43)(134, "div", 41)(135, "h2");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](136, "Links");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](137, "button", 37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_Template_button_click_137_listener() {
            return ctx.addLinkTile(null, "active", "", "");
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](138, "Add link");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](139, "div", 38);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("cdkDropListDropped", function EditProductComponent_Template_div_cdkDropListDropped_139_listener($event) {
            return ctx.dropLink($event);
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](140, EditProductComponent_div_140_Template, 18, 4, "div", 42);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](141, "div", 44)(142, "button", 45);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function EditProductComponent_Template_button_click_142_listener() {
            return ctx.updateProduct();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](143, " Update product ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()()()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](13);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.isLoading);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.productForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", ctx.selectedStore == null ? null : ctx.selectedStore.store_name);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.storeCategories);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](12);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", true);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", false);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](18);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.quantityTypes);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](11);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", "percentage");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", "amount");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](12);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", true);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("value", false);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.productForm == null ? null : ctx.productForm.value == null ? null : ctx.productForm.value.product == null ? null : ctx.productForm.value.product.is_product_returnable);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](37);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productImages);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productContents);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngForOf", ctx.productLinks);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_7__.NgClass, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_7__.NgIf, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_2__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormGroupName, _angular_forms__WEBPACK_IMPORTED_MODULE_2__.FormArrayName, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__.MatFormField, _angular_material_form_field__WEBPACK_IMPORTED_MODULE_8__.MatLabel, _angular_material_input__WEBPACK_IMPORTED_MODULE_9__.MatInput, _angular_material_select__WEBPACK_IMPORTED_MODULE_10__.MatSelect, _angular_material_core__WEBPACK_IMPORTED_MODULE_11__.MatOption, _angular_material_progress_spinner__WEBPACK_IMPORTED_MODULE_12__.MatProgressSpinner, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.CdkDropList, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.CdkDrag, _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_3__.CdkDragPlaceholder],
      styles: [".example-list[_ngcontent-%COMP%] {\n  width: 500px;\n  max-width: 100%;\n  border: solid 1px #ccc;\n  min-height: 60px;\n  display: block;\n  background: white;\n  border-radius: 4px;\n  overflow: hidden;\n}\n\n.example-box[_ngcontent-%COMP%] {\n  padding: 20px 10px;\n  border-bottom: solid 1px #ccc;\n  color: rgba(0, 0, 0, 0.87);\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-between;\n  box-sizing: border-box;\n  cursor: move;\n  background: white;\n  font-size: 14px;\n}\n\n.cdk-drag-preview[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  border-radius: 4px;\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\n}\n\n.cdk-drag-animating[_ngcontent-%COMP%] {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.example-box[_ngcontent-%COMP%]:last-child {\n  border: none;\n}\n\n.example-list.cdk-drop-list-dragging[_ngcontent-%COMP%]   .example-box[_ngcontent-%COMP%]:not(.cdk-drag-placeholder) {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.example-custom-placeholder[_ngcontent-%COMP%] {\n  background: #ccc;\n  border: dotted 3px #999;\n  min-height: 60px;\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n/*# sourceURL=webpack://./src/app/pages/products/edit-product/edit-product.component.scss */\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvcGFnZXMvcHJvZHVjdHMvZWRpdC1wcm9kdWN0L2VkaXQtcHJvZHVjdC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNJLFlBQUE7RUFDQSxlQUFBO0VBQ0Esc0JBQUE7RUFDQSxnQkFBQTtFQUNBLGNBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7QUFDSjs7QUFFRTtFQUNFLGtCQUFBO0VBQ0EsNkJBQUE7RUFDQSwwQkFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtFQUNBLG1CQUFBO0VBQ0EsOEJBQUE7RUFDQSxzQkFBQTtFQUNBLFlBQUE7RUFDQSxpQkFBQTtFQUNBLGVBQUE7QUFDSjs7QUFFRTtFQUNFLHNCQUFBO0VBQ0Esa0JBQUE7RUFDQSxxSEFBQTtBQUNKOztBQUlFO0VBQ0Usc0RBQUE7QUFESjs7QUFJRTtFQUNFLFlBQUE7QUFESjs7QUFJRTtFQUNFLHNEQUFBO0FBREo7O0FBSUU7RUFDRSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxzREFBQTtBQURKIiwic291cmNlc0NvbnRlbnQiOlsiLmV4YW1wbGUtbGlzdCB7XG4gIHdpZHRoOiA1MDBweDtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBib3JkZXI6IHNvbGlkIDFweCAjY2NjO1xuICBtaW4taGVpZ2h0OiA2MHB4O1xuICBkaXNwbGF5OiBibG9jaztcbiAgYmFja2dyb3VuZDogd2hpdGU7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cblxuLmV4YW1wbGUtYm94IHtcbiAgcGFkZGluZzogMjBweCAxMHB4O1xuICBib3JkZXItYm90dG9tOiBzb2xpZCAxcHggI2NjYztcbiAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC44Nyk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgY3Vyc29yOiBtb3ZlO1xuICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgZm9udC1zaXplOiAxNHB4O1xufVxuXG4uY2RrLWRyYWctcHJldmlldyB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgYm94LXNoYWRvdzogMCA1cHggNXB4IC0zcHggcmdiYSgwLCAwLCAwLCAwLjIpLCAwIDhweCAxMHB4IDFweCByZ2JhKDAsIDAsIDAsIDAuMTQpLCAwIDNweCAxNHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMTIpO1xufVxuXG4uY2RrLWRyYWctYW5pbWF0aW5nIHtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDI1MG1zIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpO1xufVxuXG4uZXhhbXBsZS1ib3g6bGFzdC1jaGlsZCB7XG4gIGJvcmRlcjogbm9uZTtcbn1cblxuLmV4YW1wbGUtbGlzdC5jZGstZHJvcC1saXN0LWRyYWdnaW5nIC5leGFtcGxlLWJveDpub3QoLmNkay1kcmFnLXBsYWNlaG9sZGVyKSB7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAyNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKTtcbn1cblxuLmV4YW1wbGUtY3VzdG9tLXBsYWNlaG9sZGVyIHtcbiAgYmFja2dyb3VuZDogI2NjYztcbiAgYm9yZGVyOiBkb3R0ZWQgM3B4ICM5OTk7XG4gIG1pbi1oZWlnaHQ6IDYwcHg7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAyNTBtcyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKTtcbn0iXSwic291cmNlUm9vdCI6IiJ9 */"]
    });
  }
}

/***/ }),

/***/ 9653:
/*!***********************************************************!*\
  !*** ./src/app/pages/products/products-routing.module.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductsRoutingModule": () => (/* binding */ ProductsRoutingModule)
/* harmony export */ });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/router */ 124);
/* harmony import */ var _bulk_create_products_bulk_create_products_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bulk-create-products/bulk-create-products.component */ 1982);
/* harmony import */ var _createproducts_createproducts_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createproducts/createproducts.component */ 6309);
/* harmony import */ var _edit_product_edit_product_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit-product/edit-product.component */ 7339);
/* harmony import */ var _productslist_productslist_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./productslist/productslist.component */ 1180);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ 2560);







const routes = [{
  path: '',
  component: _productslist_productslist_component__WEBPACK_IMPORTED_MODULE_3__.ProductslistComponent
}, {
  path: 'create',
  component: _createproducts_createproducts_component__WEBPACK_IMPORTED_MODULE_1__.CreateproductsComponent
}, {
  path: 'update/:store_id/:product_id',
  component: _edit_product_edit_product_component__WEBPACK_IMPORTED_MODULE_2__.EditProductComponent
}, {
  path: 'bulkcreate',
  component: _bulk_create_products_bulk_create_products_component__WEBPACK_IMPORTED_MODULE_0__.BulkCreateProductsComponent
}];
class ProductsRoutingModule {
  static {
    this.ɵfac = function ProductsRoutingModule_Factory(t) {
      return new (t || ProductsRoutingModule)();
    };
  }
  static {
    this.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineNgModule"]({
      type: ProductsRoutingModule
    });
  }
  static {
    this.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjector"]({
      imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule.forChild(routes), _angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
    });
  }
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵsetNgModuleScope"](ProductsRoutingModule, {
    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule],
    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_5__.RouterModule]
  });
})();

/***/ }),

/***/ 5712:
/*!***************************************************!*\
  !*** ./src/app/pages/products/products.module.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductsModule": () => (/* binding */ ProductsModule)
/* harmony export */ });
/* harmony import */ var _products_routing_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./products-routing.module */ 9653);
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/shared/shared.module */ 4466);
/* harmony import */ var _productslist_productslist_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./productslist/productslist.component */ 1180);
/* harmony import */ var _createproducts_createproducts_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./createproducts/createproducts.component */ 6309);
/* harmony import */ var _edit_product_edit_product_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./edit-product/edit-product.component */ 7339);
/* harmony import */ var _bulk_create_products_bulk_create_products_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./bulk-create-products/bulk-create-products.component */ 1982);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/core */ 2560);







class ProductsModule {
  static {
    this.ɵfac = function ProductsModule_Factory(t) {
      return new (t || ProductsModule)();
    };
  }
  static {
    this.ɵmod = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineNgModule"]({
      type: ProductsModule
    });
  }
  static {
    this.ɵinj = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵdefineInjector"]({
      imports: [_products_routing_module__WEBPACK_IMPORTED_MODULE_0__.ProductsRoutingModule, _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule]
    });
  }
}
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_6__["ɵɵsetNgModuleScope"](ProductsModule, {
    declarations: [_productslist_productslist_component__WEBPACK_IMPORTED_MODULE_2__.ProductslistComponent, _createproducts_createproducts_component__WEBPACK_IMPORTED_MODULE_3__.CreateproductsComponent, _edit_product_edit_product_component__WEBPACK_IMPORTED_MODULE_4__.EditProductComponent, _bulk_create_products_bulk_create_products_component__WEBPACK_IMPORTED_MODULE_5__.BulkCreateProductsComponent],
    imports: [_products_routing_module__WEBPACK_IMPORTED_MODULE_0__.ProductsRoutingModule, _shared_shared_module__WEBPACK_IMPORTED_MODULE_1__.SharedModule]
  });
})();

/***/ }),

/***/ 1180:
/*!***********************************************************************!*\
  !*** ./src/app/pages/products/productslist/productslist.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProductslistComponent": () => (/* binding */ ProductslistComponent)
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


















function ProductslistComponent_div_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](1, "mat-spinner");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_th_27_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Product Id ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_td_28_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r13 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r13.product_id, " ");
  }
}
function ProductslistComponent_th_30_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Product Name");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_td_31_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r14 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r14.product_name, " ");
  }
}
function ProductslistComponent_th_33_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Product Price ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_td_34_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r15 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" $", element_r15.product_price.toFixed(2), " ");
  }
}
function ProductslistComponent_th_36_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Store Name ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_td_37_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const element_r16 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", element_r16.store_name, " ");
  }
}
function ProductslistComponent_th_39_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "th", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, " Actions ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
}
function ProductslistComponent_td_40_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "td", 32)(1, "button", 34)(2, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](3, "more_vert");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "mat-menu", null, 35)(6, "button", 36)(7, "mat-icon");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, "remove_red_eye");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10, "View");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()();
  }
  if (rf & 2) {
    const element_r17 = ctx.$implicit;
    const _r18 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵreference"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("matMenuTriggerFor", _r18);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/products/update/" + element_r17.store_id + "/" + element_r17.product_id);
  }
}
function ProductslistComponent_tr_41_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "tr", 37);
  }
}
function ProductslistComponent_tr_42_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](0, "tr", 38);
  }
}
const _c0 = function () {
  return [5, 10, 20];
};
class ProductslistComponent {
  constructor(api, fb) {
    this.api = api;
    this.fb = fb;
    this.query = "";
    this.isLoadingResults = true;
    this.displayedColumns = ['product_id', 'product_name', 'Product Price', 'Store Name', 'Action'];
    this.data = [];
    this.resultsLength = 0;
    this.sortBy = 'product_id';
    this.stores = [];
    this.filterForm = this.fb.group({
      q: ['']
    });
    this.filterForm.valueChanges.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.tap)(() => this.isLoadingResults = true), (0,rxjs__WEBPACK_IMPORTED_MODULE_3__.delay)(1000)).subscribe(() => {
      this.api.productList(this.query, [], this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction).subscribe(data => {
        this.isLoadingResults = false;
        if (data === null) {
          return [];
        }
        this.resultsLength = data.total_count;
        this.data = data.products.map(product => {
          return {
            store_id: product.store.store_id,
            product_id: product.product_id,
            product_name: product.product_name,
            product_price: product.product_price,
            store_name: product.store.store_name
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
      return this.api.productList(this.query, [], this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_7__.map)(data => {
      this.isLoadingResults = false;
      // Flip flag to show that loading has finished.
      if (data === null) {
        return [];
      }
      this.resultsLength = data.total_count;
      return data.products.map(product => {
        return {
          store_id: product.store.store_id,
          product_id: product.product_id,
          product_name: product.product_name,
          product_price: product.product_price,
          store_name: product.store.store_name
        };
      });
    })).subscribe(data => this.data = data);
  }
  static {
    this.ɵfac = function ProductslistComponent_Factory(t) {
      return new (t || ProductslistComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_api_service__WEBPACK_IMPORTED_MODULE_0__.ApiService), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_8__.FormBuilder));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: ProductslistComponent,
      selectors: [["app-productslist"]],
      viewQuery: function ProductslistComponent_Query(rf, ctx) {
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
      decls: 44,
      vars: 12,
      consts: [[1, "content-header"], [1, "container-fluid"], [1, "row", "mb-2"], [1, "col-sm-6"], [1, "col-sm-6", "d-flex", "flex-wrap"], [1, "btn-group", "ml-auto"], [1, "btn", "btn-primary", 3, "routerLink"], [1, "btn-group", "ml-3"], [1, "btn", "btn-secondary", 3, "routerLink"], [1, "content"], [1, "container-fluid", "mb-4"], [1, "card", "py-3"], [1, "card-head", "d-flex", 3, "formGroup"], [1, "ml-3"], ["matInput", "", "placeholder", "Search", "formControlName", "q", 3, "ngModel", "ngModelChange"], [1, "container-fluid", "pb-5", "position-relative"], ["class", "overlay-spinner", 4, "ngIf"], [1, "mat-elevation-z8"], ["mat-table", "", "matSort", "", "matSortDisableClear", "", "matSortDirection", "desc", 3, "dataSource", "matSortActive"], ["matColumnDef", "product_id"], ["mat-header-cell", "", "mat-sort-header", "", "disableClear", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "product_name"], ["matColumnDef", "Product Price"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["matColumnDef", "Store Name"], ["matColumnDef", "Action"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", "aria-label", "Select page of periodic elements", 3, "pageSizeOptions", "length"], [1, "overlay-spinner"], ["mat-header-cell", "", "mat-sort-header", "", "disableClear", ""], ["mat-cell", ""], ["mat-header-cell", ""], ["mat-icon-button", "", "aria-label", "Example icon-button with a menu", 3, "matMenuTriggerFor"], ["menu", "matMenu"], ["mat-menu-item", "", 1, "pr-5", 3, "routerLink"], ["mat-header-row", ""], ["mat-row", ""]],
      template: function ProductslistComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Products List");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](6, "div", 4)(7, "div", 5)(8, "button", 6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](9, " Create Product ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](10, "div", 7)(11, "button", 8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](12, " Create Products (bulk) ");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](13, "div", 4);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](14, "section", 9)(15, "div", 10)(16, "div", 11)(17, "form", 12)(18, "mat-form-field", 13)(19, "mat-label");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](20, "Search");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](21, "input", 14);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("ngModelChange", function ProductslistComponent_Template_input_ngModelChange_21_listener($event) {
            return ctx.query = $event;
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()()()();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](22, "div", 15);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](23, ProductslistComponent_div_23_Template, 2, 0, "div", 16);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](24, "div", 17)(25, "table", 18);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](26, 19);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](27, ProductslistComponent_th_27_Template, 2, 0, "th", 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](28, ProductslistComponent_td_28_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](29, 22);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](30, ProductslistComponent_th_30_Template, 2, 0, "th", 20);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](31, ProductslistComponent_td_31_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](32, 23);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](33, ProductslistComponent_th_33_Template, 2, 0, "th", 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](34, ProductslistComponent_td_34_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](35, 25);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](36, ProductslistComponent_th_36_Template, 2, 0, "th", 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](37, ProductslistComponent_td_37_Template, 2, 1, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerStart"](38, 26);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](39, ProductslistComponent_th_39_Template, 2, 0, "th", 24);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](40, ProductslistComponent_td_40_Template, 11, 2, "td", 21);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementContainerEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](41, ProductslistComponent_tr_41_Template, 1, 0, "tr", 27);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](42, ProductslistComponent_tr_42_Template, 1, 0, "tr", 28);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelement"](43, "mat-paginator", 29);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](8);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/products/create/");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("routerLink", "/products/bulkcreate/");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](6);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("formGroup", ctx.filterForm);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](4);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngModel", ctx.query);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.isLoadingResults);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("dataSource", ctx.data)("matSortActive", ctx.sortBy);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](16);
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

/***/ })

}]);
//# sourceMappingURL=src_app_pages_products_products_module_ts.js.map