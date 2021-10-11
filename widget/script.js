define ( [ 'jquery', 'underscore', 'twigjs', 'lib/components/base/modal' ], function( $, _, Twig, Modal ){
  let CustomWidget = function(){

    let self = this;

    this.fieldsConfig = {
      blackclevertech: {
        storeAddress: 421381, // Магазин квал
        client: 425917, // Клиент
        desiredVacancy: 425919, // Желаемая вакансия
        desiredDistance: 421387, // Желаемое расстояние
        residenceAddressFirst: 421389, // Адрес проживания 1
        city: 421393 // Город
      },
      gigant: {
        storeAddress: 673178, // Магазин квал
        client: 670010, // Клиент
        desiredVacancy: 327081, // Желаемая вакансия
        desiredDistance: 673180, // Желаемое расстояние
        residenceAddressFirst: 662511, // Адрес проживания 1
        city: 657485 // Город
      }
    };

    this.config = {
      isDev: false, // flag of development
      baseUrl: 'https://growth-amo.gigwork.ru',
      widgetsName: 'NearestShops',
      widgetPrefix: 'gigantSearchNearestShops', // префикс для селекторов

      // api google maps key
      googleMapsApiKey: 'AIzaSyDV_zZ98V1peVUOohJ2PygzMEzM4A0z8W4',

      modalWidth: 1200,
      modalHeight: 700,
      tableHeight: 550,

      fields: this.isDev ? self.fieldsConfig.blackclevertech : self.fieldsConfig.gigant,

      code: null,
      ignoreFull: false,
      ignore85procent: false,
      priorityPrint: -1,
      sortDirectionDistance: true,
      sortDirectionShopName: true,
      sortDirectionAddress: true,
      sortDirectionVacancy: true
    };

    this.defaultFieldsData = {
      storeAddress: null,
      client: null,
      desiredVacancy: null,
      desiredDistance: 0,
      residenceAddressFirst: null,
      city: null,
    };

    // selectors
    this.selectors = {
      // id buttons
      availableShopsBtnId: `${self.config.widgetPrefix}-available-shops-btn`,
      availableShopsBtnPresaleId: `${self.config.widgetPrefix}-available-shops-presale-btn`,
      loadShopsBtnId: `${self.config.widgetPrefix}-modal-load-shops-btn`,
      searchBtnId: `${self.config.widgetPrefix}-modal-search-btn`,
      sortBtnId: `${self.config.widgetPrefix}-modal-sort-btn`,
      limitFastInput: {
        '3': `${self.config.widgetPrefix}-modal-limit-fast-input-3-btn`,
        '5': `${self.config.widgetPrefix}-modal-limit-fast-input-5-btn`,
        '10': `${self.config.widgetPrefix}-modal-limit-fast-input-10-btn`,
      },
      priorityBtnId_0: `${self.config.widgetPrefix}-modal-priority-0-btn`,
      priorityBtnId_1: `${self.config.widgetPrefix}-modal-priority-1-btn`,
      priorityBtnId_2: `${self.config.widgetPrefix}-modal-priority-2-btn`,
      priorityBtnId_3: `${self.config.widgetPrefix}-modal-priority-3-btn`,
      priorityBtnIdReset: `${self.config.widgetPrefix}-modal-priority-reset-btn`,

      // id of modal elements
      modalId: `${self.config.widgetPrefix}-modal`,
      modalClass: `${self.config.widgetPrefix}-modal`,
      modalFormId: `${self.config.widgetPrefix}-modal-form`,
      modalTableId: `${self.config.widgetPrefix}-modal-table`,
      modalAddressId: `${self.config.widgetPrefix}-modal-address`,
      modalLimitId: `${self.config.widgetPrefix}-modal-limit`,
      modalSearchShopsId: `${self.config.widgetPrefix}-modal-search-shops`,
      modalSearchVacanciesId: `${self.config.widgetPrefix}-modal-search-vacancies`,
      ignoreFullCheckboxId: `${self.config.widgetPrefix}-modal-ignore-full`,
      ignore85ProcentCheckboxId: `${self.config.widgetPrefix}-modal-ignore-85-procent`,

      listTable: `${self.config.widgetPrefix}-list_table`, // FIXME
      tableBody: 'table_body',
      tableHead: 'table_head',

      // additional classes
      clickableVacancyClass: `${self.config.widgetPrefix}-vacancy-name-clickable`,
      modalCloseClass: 'icon-modal-close',
      colorBtn: {
          blue: 'button-input_blue',
          white: 'button-input_white',
          grey: 'button-input-more',
      },

      // selectors to insert
      availableShopsBtnDefaultTab: 'div[class="card-entity-form__main-fields js-card-main-fields"]',
      availableShopsBtnPresaleTab: self.config.isDev ? 'div[data-id="leads_68831626952187"][class="linked-forms__group-wrapper linked-forms__group-wrapper_main js-cf-group-wrapper"]' : 'div[data-id="leads_7051560430437"][class="linked-forms__group-wrapper linked-forms__group-wrapper_main js-cf-group-wrapper"]',

      js: {
        listTable: `#${self.config.widgetPrefix}-list_table`, // FIXME
        tableRow: 'div[data-id="tableRow"]',
        tableRow_nichts: 'div[data-id="tableRow_nichts"]'
      },

      tableRowLink: `${self.config.widgetPrefix}_table-row_link`
    };

    // hardcode html
    this.html = {
      // базовая разметка модального окна
      modal: `
        <div id="${self.selectors.modalFormId}">
          <span class="modal-body__close"><span class="icon ${self.selectors.modalCloseClass}"></span></span>

          <br><br><br>

          <div style="display: grid; grid-template-columns: 73% 27%;">
            <div style="display: grid; grid-template-columns: 70% 30%;">
              <span id="${self.selectors.modalAddressId}-span" class="half-width"></span>
              <span id="${self.selectors.modalLimitId}-span" class="half-width"></span>
            </div>

            <div style="text-align: right;">
              <span id="${self.selectors.limitFastInput['3']}-span"></span>
              <span id="${self.selectors.limitFastInput['5']}-span"></span>
              <span id="${self.selectors.limitFastInput['10']}-span"></span>
              <span id="${self.selectors.loadShopsBtnId}-span"></span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 45% 55%;">
            <div>
              <span id="${self.selectors.modalSearchShopsId}-span"></span>
              <span id="${self.selectors.modalSearchVacanciesId}-span"></span>
              <span id="${self.selectors.searchBtnId}-span"></span>
            </div>

            <div style="text-align: right;">
              <span id="${self.selectors.priorityBtnId_1}-span" style="margin-left:20.1%"></span>
              <span id="${self.selectors.priorityBtnId_2}-span"></span>
              <span id="${self.selectors.priorityBtnId_3}-span"></span>
              <span id="${self.selectors.priorityBtnId_0}-span"></span>
              <span id="${self.selectors.priorityBtnIdReset}-span"></span>
            </div>
          </div>

          <div>
            <span id="${self.selectors.ignoreFullCheckboxId}-span"></span>
            <span id="${self.selectors.ignore85ProcentCheckboxId}-span"></span>
          </div>
        </div>

        <div id="${self.selectors.modalTableId}" style="overflow: auto; margin-top: 35px;"></div>
      `,

      baseTable: `
        <div class="${self.config.widgetPrefix}_list__table__holder ${self.config.widgetPrefix}_js-hs-scroller ${self.config.widgetPrefix}_custom-scroll">
          <div class="js-scroll-container ${self.config.widgetPrefix}_list__table" id="${self.selectors.listTable}">
          </div>
        </div>
      `,

      modalCloseIcon : `<span class="modal-body__close"><span class="icon ${self.selectors.modalCloseClass}"></span></span>`
    };

    // methods for getting / counting / converting 
    this.getters = {

      // взять адрес соискателя и его лимит
      getEmployeeData: function () {
        const fields = self.config.fields;
        const defaults = self.defaultFieldsData;
        const limit = self.helpers.getFieldValue( fields.desiredDistance ) || defaults.desiredDistance;
        const address = self.helpers.getFieldValue( fields.residenceAddressFirst ) || defaults.residenceAddressFirst;
        const vacancyWanted = self.helpers.getFieldValue( fields.desiredVacancy ) || defaults.desiredVacancy;
        const shopAddress = self.helpers.getFieldValue( fields.storeAddress ) || defaults.storeAddress;
        const shopName = self.helpers.getFieldValue( fields.client ) || defaults.client;
        const city = self.helpers.getFieldValue( fields.city ) || defaults.city;

        const employeeData = {
          address,
          limit,
          vacancyWanted,
          shopAddress,
          shopName,
          city,
        }

        return employeeData;
      },

      // взять координаты соискателя и его лимит из соответствующих полей в модальном окне
      getEmployeeDataFromModal: function () {
        console.debug( `modalLimitId: #${self.selectors.modalLimitId}` ); // Debug
        console.debug($( `#${self.selectors.modalLimitId}` )); // Debug

        const address = $( `#${self.selectors.modalAddressId}` )[ 0 ].value;
        const limit = $( `#${self.selectors.modalLimitId}` )[ 0 ].value;

        const employeeData = {
          address: address,
          limit: parseInt( limit )
        }

        return employeeData;
      },

      // взять координаты соискателя и его лимит из соответствующих полей в модальном окне
      getEmployeeDataWithCoordinatesFromModal: function () {

        let employeeData = self.getters.getEmployeeDataFromModal();

        return employeeData;
      },

      /**
       * send requset, that to take information about shops
       * eine Anfrage an den Server stellen, um Informationen über bestehende Stellenangebote zu erhalten
       * 
       * @param {obj} shopsExportData 
       * @param {obj} callback : {
       *    exec : {func},
       *    params : {obj}
       * }
       */
      getShopsData: function ( shopsExportData, callback = {} ) {
        console.debug( self.config.widgetsName + ' << [getter] : getShopsData' );
        console.debug( 'input data: ' );
        console.debug( shopsExportData );
        console.debug( callback );

        $.ajax(
          {
            timeout: 3000000,
            method : "POST",
            url : self.config.baseUrl + '/api/search/load',
            dataType : "json",
            data : {
              address : shopsExportData.address,
              limit : shopsExportData.limit,
              lead_id : shopsExportData.lead_id
            }
          }
        )
        .fail(
          function ( data ) {
            console.error( 'ajax is fail' );
            console.error( data );
          }
        )
        .success(
          function ( shopsData ) { // FIXME
            console.debug( 'ajax is success' );
            console.debug( shopsData );

            if ( typeof callback.exec === "function" )
            {
              callback.exec( callback.params, shopsData );
            }
          }
        );
      },

      // получить только названия вакансий из массива с информацией о вакансии
      getVacanciesNames: function ( vacancies ) {

        let names = [];

        for ( let i = 0; i < vacancies.length; i += 1 )
        {
          names.push( vacancies[ i ].name );
        }

        return names;
      },

      // посчитать загрузку для одной вакансии
      getVacancyNameWithNeed: function ( vacancyName, vacancyObj ) {

        const x = parseInt( vacancyObj.need );
        const y = parseInt( vacancyObj.real_need );
        let need = 0;

        if ( x != 0 )
        {
          need = ( ( x - y ) / x ) * 100;
        }

        need = parseFloat( need.toFixed( 2 ) );

        return need;
      },

      // сделать из названий вакансий кликабельные подчеркнутые элементы
      getClickableVacancies: function ( vacancies, index ) {

        const spanStart = `<span class="${self.selectors.clickableVacancyClass}" id="table-entry-vacancy-name-${index}" data-table-position="${index}" style="text-decoration: underline; cursor: pointer;">`;
        const spanEnd = '</span>';
        let clickableVacancies = [];

        for ( let i = 0; i < vacancies.length; i += 1 )
        {
          clickableVacancies.push( spanStart + vacancies[ i ] + spanEnd );
        }

        return clickableVacancies;
      },

      getClickableAddress: function ( from, to ) {

        const fromEncoded = encodeURIComponent( from );
        const toEncoded = encodeURIComponent( to );
        const routeUrl = `https://www.google.com/maps/dir/${fromEncoded}/${toEncoded}`;

        return `<a class="${self.selectors.tableRowLink}" target="_blank" href="${routeUrl}">${to}</a>`;
      },

      // сделать из названий магазина элемент который можно найти по id
      getSearchableShopName: function ( shopName, index ) {
        return `<span id="table-entry-shop-name-${index}" data-table-position="${index}" >${shopName}</span>`;
      },

      // сделать из адреса магазина элемент который можно найти по id
      getSearchableShopAddress: function ( shopAddress, shopAddressRaw, index ) {
        return `<span id="table-entry-shop-address-${index}" data-table-position="${index}" data-shop-address="${shopAddressRaw}">${shopAddress}</span>`;
      },

      getChoiceId: function ( nameFromTable, choices ) {

        nameFromTable = self.helpers.strToStandart( nameFromTable );

        console.debug( '[debug]getChoiceId' );
        console.debug( nameFromTable );

        const fields = self.config.fields;

        if ( choices[ nameFromTable ] != undefined )
        {
          // то есть если название вакансии точно такое же как в выпадающем списке
          console.debug( '[debug]название вакансии/магазина точно такое же как в выпадающем списке' );

          return choices[ nameFromTable ];
        }
        else
        {
          console.debug( '[debug]название вакансии/магазина НЕ точно такое же как в выпадающем списке' );

          for ( сhoiceName in choices )
          {
            const condition = nameFromTable.toLowerCase().includes( сhoiceName.toLowerCase() );

            if ( condition )
            {
              return choices[ сhoiceName ];
            }
          }
        }

        console.debug(`[debug]вакансии/магазина ${nameFromTable} нет в списке допустимых вакансий в поле ${fields['Желаемая вакансия']}/${fields['Клиент']}`);

        return null;
      },

      getVacancyChoiceId: function ( vacancyNameFromTable ) {

        console.debug( '[debug]getVacancyChoiceId' );
        const vacancyChoices = self.config.fields.vacancies;

        return self.getters.getChoiceId( vacancyNameFromTable, vacancyChoices );
      },

      getShopNameChoiceId: function ( shopNameFromTable ) {

        console.debug( '[debug]getShopNameChoiceId' );

        const shopChoices = self.config.fields.shopNames;

        return self.getters.getChoiceId( shopNameFromTable, shopChoices );
      },

      getIntervalsStr: function ( vacancyObj ) {

        let intervals = vacancyObj.intervals;

        intervals.forEach( ( value, index, arr ) => {

          let start = value.start.split( ':' )[ 0 ];
          let end = value.end.split( ':' )[ 0 ];

          arr[ index ] = `${start}-${end}`;
        } );

        const intervalsStr = intervals.join(', ');

        return intervalsStr;
      },

      getDataFromTable: function () {
        let originalVacancyList = $( 'div[data-id="tableRow"]' );
        let vacancyList = [];

        for ( let vacancy = 0; vacancy < originalVacancyList.length; vacancy++ )
        {
          vacancyList.push(
            {
              priority: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="priority"] span[data-id="tableRow_priority__span"]' )[ 0 ].innerText,
              shopName: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="shopName"] span[data-id="tableRow_shopName__span"]' )[ 0 ].innerHTML,
              shopNameText: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="shopName"] span[data-id="tableRow_shopName__span"]' )[ 0 ].innerText,
              addressText: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="address"] span[data-id="tableRow_address__span"]' )[ 0 ].innerText,
              address: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="address"] span[data-id="tableRow_address__span"]' )[ 0 ].innerHTML,
              distance: parseFloat( originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="distance"] span[data-id="tableRow_distance__span"]' )[ 0 ].innerText ),
              vacancy: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="vacancy"] span[data-id="tableRow_vacancy__span"]' )[ 0 ].innerHTML,
              gender: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="gender"] span[data-id="tableRow_gender__span"]' )[ 0 ].innerHTML,
              salary: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="salary"] span[data-id="tableRow_salary__span"]' )[ 0 ].innerHTML,
              needRaw: parseFloat( originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="vacancy"] span[data-id="tableRow_vacancy__span"]' )[ 0 ].getAttribute( 'data-value' ) ),
              intervals: originalVacancyList[ vacancy ].querySelectorAll( 'div[data-field-code="intervals"] span[data-id="tableRow_intervals__span"]' )[ 0 ].innerText
            }
          );
        }

        console.debug( vacancyList ); // Debug

        return vacancyList.length ? vacancyList : false;
      }
    };

    // методы хелперы
    this.helpers = {

      getFieldValue: function ( id ) {

        let val = $( '.tr_wrapper_'+id ).find( ':input' ).val();

        return val || $( ':input[name="CFV['+ id +']"]' ).val();
      },

      // взять данные из запроса и превратить их в данные для рендера таблицы
      convertDataToTableFormat: function ( inputData, employeeAddress, sortFunction = self.helpers.nearToFarSort ) {
        const distanceTitle = `<span id="${self.selectors.sortBtnId}" style="cursor: pointer;">Расстояние</span>`;

        let data = {
          not_show_chbx: true,
          fields: [
            {
              code: 'priority',
              title: 'Приоритет',
              shown: true,
              template: 'text_raw',
              width: 9,
            },
            {
              code: 'shopName',
              title: 'Клиент',
              shown: true,
              template: 'text_raw',
              width: 17,
            },
            {
              code: 'address',
              title: 'Адрес',
              shown: true,
              template: 'text_raw',
              width: 37,
            },
            {
              code: 'distance',
              title: distanceTitle,
              shown: true,
              template: 'text_raw',
              width: 8,

            },
            {
              code: 'vacancy',
              title: 'Вакансия',
              shown: true,
              template: 'text_raw',
              width: 14,
            },
            {
              code: 'intervals',
              title: 'Время',
              shown: true,
              template: 'text_raw',

            },
          ],
          items: []
        }

        for ( let i = 0; i < inputData.length; i += 1 )
        {
          const shopNameRaw = inputData[ i ].name;
          const vacanciesRaw = inputData[ i ].vacancies;
          const addressRaw = inputData[ i ].address;
          const clickableAddress = self.getters.getClickableAddress( employeeAddress, addressRaw );
          const clickableSearchableAddress = self.getters.getSearchableShopAddress( clickableAddress, addressRaw, i );

          const shopName = self.getters.getSearchableShopName( shopNameRaw, i );
          let vacancies = self.getters.getVacanciesNames( vacanciesRaw );

          vacancies = self.getters.getClickableVacancies( vacancies, i );

          let shopPriority = inputData[ i ].priority;

          if ( shopPriority == 0 )
          {
            shopPriority = '';
          }

          for ( let j = 0; j < vacanciesRaw.length; j += 1 )
          {
            const need = self.getters.getVacancyNameWithNeed( vacancies[ j ], vacanciesRaw[ j ] );
            const intervals = self.getters.getIntervalsStr( vacanciesRaw[ j ] );

            if ( self.config.ignoreFull )
            {
              if ( need >= 100.0 )
              {
                continue;
              }
            }

            if ( self.config.ignore85procent )
            {
              if ( need >= 85.0 )
              {
                continue;
              }
            }

            if( self.config.priorityPrint == 0 )
            {
              if ( shopPriority != '' )
              {
                continue;
              }
            }

            if( self.config.priorityPrint == 1 )
            {
              if ( shopPriority != 1 )
              {
                continue;
              }
            }

            if( self.config.priorityPrint == 2 )
            {
              if ( shopPriority != 2 )
              {
                continue;
              }
            }

            if( self.config.priorityPrint == 3 )
            {
              if ( shopPriority != 3 )
              {
                continue;
              }
            }

            const tempShopData = {
              tags: [],
              index: i,
              shopNameRaw: shopNameRaw,
              shopName: shopName,
              addressRaw: addressRaw,
              address: clickableSearchableAddress,
              distanceNumber: parseFloat( inputData[ i ].distance.toFixed( 2 )),
              distance: inputData[ i ].distance.toFixed( 2 ),
              vacancy: `${vacancies[ j ]} ${need}%`,
              needRaw: need,
              priority:shopPriority,
              vacancyRaw: vacanciesRaw[ j ].name,
              gender : vacanciesRaw[ j ].gender,
              salary : vacanciesRaw[ j ].salary,
              intervals: intervals,
            };

            data.items.push( tempShopData );
          }
        }

        data.items = data.items.filter( self.helpers.substringSearch );
        data.items = data.items.filter( self.helpers.ignoreFull );

        // TODO defaultSort

        self.helpers.ordnen( data.items, 'distance' );

        // костыль, чтобы, если пришли пустые данные, то не рисовалась стандартная ссытка амо "показать все"
        // добавляю в таблицу строку где все значения - пустые строки, чтобы она отображалась вместо ссылки
        if ( data.items.length == 0 )
        {
          console.debug( 'пришли пустые данные' );

          return false;
        }

        return data;
      },

      nearToFarSort: function ( a, b ) {

        if ( a.distanceNumber < b.distanceNumber )
        {
          return -1;
        }
        if ( a.distanceNumber > b.distanceNumber )
        {
          return 1;
        }

        return 0;
      },

      farToNearSort: function ( a, b ) {

        if ( a.distanceNumber < b.distanceNumber )
        {
          return 1;
        }
        if ( a.distanceNumber > b.distanceNumber )
        {
          return -1;
        }

        return 0;
      },

      /**
       * 
       * @param {str} str 
       * @returns {str} resultStr
       */
      strToStandart : function ( str ) {
        const pattern = "ё";
        const re = new RegExp( pattern, "g" );
        const resultStr = str.toLowerCase().replace( re, "е" );

        return resultStr
      },

      substringSearch: function ( element ) {

        const queryShops = $(`#${self.selectors.modalSearchShopsId}`)[ 0 ].value;
        const queryVacancies = $(`#${self.selectors.modalSearchVacanciesId}`)[ 0 ].value;
        const pattern = "ё";
        const re = new RegExp( pattern, "g" );
        const stringToSearchShops = element.shopNameRaw.toLowerCase().replace( re, "е" );
        const stringToSearchVacancies = element.vacancyRaw.toLowerCase().replace( re, "е" );

        const resultShops = stringToSearchShops.includes( queryShops.toLowerCase().replace( re, "е" ) );
        const resultVacancies = stringToSearchVacancies.includes( queryVacancies.toLowerCase().replace( re, "е" ) );

        const result = (
          resultShops
          && resultVacancies
        );

        return result;
      },

      ignoreFull: function ( element )
      {
        if ( element.needRaw >= 100.0 )
        {
          return false;
        }

        return true;
      },

      ignore85Procent: function ( element ) {

          if (element.needRaw >= 85.0)
          {
            return false;
          }

          return true;
      },

      setVacanciesUnchecked: function () {

        console.log('setVacanciesUnchecked');
        const vacancyChoices = self.config.fields.vacancies;
        console.log(vacancyChoices);

        for (const vacancyName in vacancyChoices)
        {
          const vacancyChoiceId = vacancyChoices[vacancyName];
          const vacancyWantedSelector = `[name="CFV[${self.config.fields.desiredVacancy}][${vacancyChoiceId}]"]`;
          console.log(vacancyWantedSelector);
          console.log("$(vacancyWantedSelector).prop('checked', false);");
          $(vacancyWantedSelector).prop('checked', false);
        }
      },

      setShopNamesUnchecked: function () {

        const shopChoices = self.config.fields.shopNames;

        for (const shopName in shopChoices)
        {
          const shopChoiceId = shopChoices[shopName];
          const shopNameSelector = `li[data-value="${shopChoiceId}"]`;
          const element = $(shopNameSelector);
          let hc = false;

          element.prop('checked', false);

          if (element.hasClass('control--select--list--item-selected'))
          {
            hc = true;
            element.removeClass('control--select--list--item-selected');
          }

          const debugStr = `проверяем ${shopName}:${shopChoiceId}; \nselector:${shopNameSelector}\nelement:${element}\nhasClass? ${hc}`;
        }
      },

      sortAsc: function ( a, b ) {
        if ( a < b ) return -1;
        if ( a > b ) return 1;

        return 0
      },

      sortDesc: function ( a, b ) {
        if ( a < b ) return 1;
        if ( a > b ) return -1;

        return 0
      },

      ordnen: function ( array, sortType, callback = false, sortFunc = self.helpers.sortAsc ) {
        switch ( sortType )
        {
          case 'shopName':
            array.sort( ( a, b ) => {
              let shopNameA = a.shopNameText.toLowerCase();
              let shopNameB = b.shopNameText.toLowerCase();

              return sortFunc( shopNameA, shopNameB );
            });
          break;

          case 'address':
            array.sort( ( a, b ) => {
              let addressA = a.addressText.toLowerCase();
              let addressB = b.addressText.toLowerCase();

              return sortFunc( addressA, addressB );
            });
          break;

          case 'distance':
            array.sort( ( a, b ) => {
              let distanceA = parseFloat( a.distance );
              let distanceB = parseFloat( b.distance );

              return sortFunc( distanceA, distanceB );
            });
          break;

          case 'vacancy':
            array.sort( ( a, b ) => {
              let vacancyA = a.needRaw;
              let vacancyB = b.needRaw;

              return sortFunc( vacancyA, vacancyB );
            });
          break;

          default:
          break;
        }

        if ( callback ) callback( array );
      },

      updateTable: function ( tableData = null, renderSpinnerFlag = false ) {
        console.debug( 'dist table update' ); // Debug

        // показать спиннер
        if ( renderSpinnerFlag ) self.renderers.renderSpinner( `.${self.selectors.modalClass}` );

        self.renderers.removeTable( self.selectors.js.tableRow );
        self.renderers.removeTable( self.selectors.js.tableRow_nichts );
        
        setTimeout(
          () => {
            self.renderers.renderTableBody(
              self.selectors.js.listTable,
              
              tableData,

              'append',

              {
                exec: function ( removeSpinnerSelector ) {
                  setTimeout(
                    () => {
                      // убрать спиннер
                      self.renderers.removeSpinner( removeSpinnerSelector );
                    },

                    500
                  );
                },

                params: `.${self.selectors.modalClass}`
              }
            );
          },

          500
        );
      },

      showTable ( params, shopsData = false ) {
        console.debug( self.config.widgetsName + ' << [helper] : showTable' );
        console.debug( 'input data: ' );
        console.debug( shopsData );

        if ( !shopsData ) return;

        // create the table with this data
        let tableData = self.helpers.convertDataToTableFormat( shopsData, params.employeeData.address, params.sortFunction );
        let tableSelector = self.selectors.js.listTable;

        console.debug( 'tableData:' ); // debug
        console.debug( tableData );

        if ( tableData )
        {
          tableData = tableData.items;
        }
        else
        {
          tableSelector = `#${self.selectors.modalTableId}`;
        }

        self.renderers.renderTableBody(
          tableSelector,

          tableData,

          'append',

          {
            exec: function ( removeSpinnerSelector ) {
              setTimeout(
                () => {
                  // delete spinner
                  self.renderers.removeSpinner( removeSpinnerSelector );
                },

                1000
              );
            },

            params: `.${self.selectors.modalClass}`
          }
        );
      }
    };

    // методы обработчики событий
    this.handlers = {
      modalLimitOnChange: function ( event ) {
          let inputValue = this.value;
          let onlyLimit = inputValue.replace(/ км/g, '');
          this.value = String(onlyLimit) + ' км';
      },

      modalDestroyHandler: function () {
        // взять данные из модального окна
        const dataFromModal = self.getters.getEmployeeDataFromModal();
        // взять данные из карточки
        const dataFromCard = self.getters.getEmployeeData();

        // если в модальном окне не заданы новые данные то выход
        if ( ( dataFromCard.address == dataFromModal.address ) && ( dataFromCard.limit == dataFromModal.limit ) )
        {
          return;
        }

        // если задан новый адрес обновить адрес в карточке
        if (dataFromCard.address != dataFromModal.address)
        {
          const addressSelector = `[name="CFV[${self.config.fields.residenceAddressFirst}]"]`;
          $( addressSelector )[ 0 ].value = dataFromModal.address;
          $( addressSelector ).trigger( 'controls:change' );
          $( addressSelector ).trigger( 'input' );
        }

        // если задан новый лимит обновить лимит в карточке
        if ( dataFromCard.limit != dataFromModal.limit )
        {
          const limitSelector = `[name="CFV[${self.config.fields.desiredDistance}]"]`;
          $( limitSelector )[ 0 ].value = dataFromModal.limit;
          $( limitSelector ).trigger( 'controls:change' );
          $( limitSelector ).trigger( 'input' );
        }

        AMOCRM.data.current_card.save();
      },

      // по клику на кнопку загрузить магазины внутри модалки
      loadShopsBtnOnClick: function ( event ) {
          console.debug('[debug]loadShopsBtnOnClick begin');
          event.preventDefault();
          event.stopPropagation();
          self.renderers.reRenderTable();
          console.debug('[debug]loadShopsBtnOnClick end');
      },

      fastInput3OnClick: function () {
          let inputElement = $(`#${self.selectors.modalLimitId}`)[0];
          inputElement.value = '3 км';
      },

      fastInput5OnClick: function () {
          let inputElement = $(`#${self.selectors.modalLimitId}`)[0];
          inputElement.value = '5 км';
      },

      fastInput10OnClick: function () {
          let inputElement = $(`#${self.selectors.modalLimitId}`)[0];
          inputElement.value = '10 км';
      },

      // по клику на кнопку доступные магазины
      availableShopsBtnOnClick: function ( event ) {  // start modal fenster // FIXME START
        event.preventDefault();
        event.stopPropagation();

        // порядок такой:
        // рендерить пустую модалку чтобы туда потом добавлять элементы
        // два верхних поля и кнопку и шапку таблицы можно показать сразу
        // показать спиннер поверх модалки
        // отправить запрос
        // получить данные
        // с данными составить таблицу
        // убрать спиннер
        // перерендериваем таблицу

        // рендерить пустую модалку чтобы туда потом добавлять элементы
        // 1. render empty modal
        self.renderers.modalWindow.show( self.selectors.modalId, self.html.modal );


        let employeeData = self.getters.getEmployeeData();

        console.debug( 'employeeData:' );
        console.debug( employeeData );

        // два верхних поля и кнопку и шапку таблицы можно показать сразу
        // 2. render modal with a form and table top
        self.renderers.renderForm( `#${self.selectors.modalFormId}`, employeeData );
        // рендер пустой таблицы
        self.renderers.renderBaseTable( `#${self.selectors.modalTableId}` );

        if ( !employeeData.address )
        {
          self.renderers.renderTableBody(
            `#${self.selectors.modalTableId}`,

            false,

            'append',

            {
              exec: function ( removeSpinnerSelector ) {
                setTimeout(
                  () => {
                    self.renderers.removeSpinner( removeSpinnerSelector );
                  },

                  2000
                );
              },

              params: `.${self.selectors.modalClass}`
            }
          );
        }
        else
        {
          // показать спиннер
          // отправить запрос
          // получить данные
          // с данными составить таблицу
          // убрать спиннер
          // перерендериваем таблицу
          self.renderers.reRenderTable();
        }
      },

      // по клику на название вакансии в таблице
      vacancyNameOnClick: function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        let $target = $( event.currentTarget );
        let vacancyName = $target[ 0 ].innerHTML;
        let tablePosition = $target.attr( 'data-table-position' );
        let shopAddress = $( `#table-entry-shop-address-${tablePosition}` ).attr( 'data-shop-address' );
        let shopAddressSelector = `[name="CFV[${self.config.fields.storeAddress}]"]`;
        let vacancyChoiceId = self.getters.getVacancyChoiceId( vacancyName );
        let shopName = $( `#table-entry-shop-name-${tablePosition}` )[ 0 ].innerHTML;

        let regexpStr = /\s+\([A-Za-zА-Яа-яЁё\s+]*\)/g;
        shopName = shopName.replace( regexpStr, "" );

        console.debug( 'shopName:' ); // Debug
        console.debug( shopName ); // Debug

        if ( vacancyChoiceId != null )
        {
          const vacancyWantedSelector = `[name="CFV[${self.config.fields.desiredVacancy}][${vacancyChoiceId}]"]`;
          let vacancyElement = $( vacancyWantedSelector );

          vacancyElement.prop( 'checked', true );
          vacancyElement.trigger( 'controls:change' );
          vacancyElement.trigger( 'input' );
        }
        else
        {
          const message = 'Не удалось найти название вакансии в списке допустимых вакансий. Имя вакансии не сохранено в карточке сделки';
          alert( message );
        }

        console.debug( 'ищем ид магазина-варианта для чеклиста' ); // Debug

        const shopNameChoiceId = self.getters.getShopNameChoiceId( shopName );

        if ( shopNameChoiceId != null )
        {
          const shopWantedSelector = `li[data-value="${shopNameChoiceId}"]`;
          const element = $( shopWantedSelector );

          element.trigger( 'click' );

          // нужно сделать removeClass('control--select--list--item-selected'); на все остальные
          self.helpers.setShopNamesUnchecked();

          // и потом выбрать нужную вакансию
          $( shopWantedSelector ).addClass( 'control--select--list--item-selected' );
          $( shopWantedSelector ).trigger( 'controls:change' );
        }
        else
        {
          const message = 'Не удалось найти название магазина в списке допустимых магазинов. Имя магазина не сохранено в карточке сделки';
          alert( message );
        }

        $( shopAddressSelector )[ 0 ].value = shopAddress;
        $( shopAddressSelector ).trigger( 'controls:change' );
        $( shopAddressSelector ).trigger( 'input' );

        AMOCRM.data.current_card.save();

        // теперь закрыть окно
        $( `span.${self.selectors.modalCloseClass}` ).trigger( 'click' );
      },

      // при вводе в поле поиска по магазину/вакансии
      modalSearchOnKeyUp: function ( event, isPriority = false, renderSpinnerFlag = true ) {
          if (event.key === 'Enter' || event.keyCode === 13) {
            self.renderers.reRenderTable( renderSpinnerFlag, isPriority );
          }
      },

      // по клику на кнопку искать магазины внутри модалки
      searchBtnOnClick: function ( event ) {
        event.preventDefault();
        event.stopPropagation();

        self.handlers.modalSearchOnKeyUp( { key: 'Enter' } );
      },

      // клик по кнопкам приоритетов
      priorityBtnId_0_OnClick: function ( element ) {
        self.config.priorityPrint = 0;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      priorityBtnId_1_OnClick: function ( element ) {
        self.config.priorityPrint = 1;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      priorityBtnId_2_OnClick: function ( element ) {
        self.config.priorityPrint = 2;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      priorityBtnId_3_OnClick: function ( element ) {
        self.config.priorityPrint = 3;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      priorityBtnIdResetOnClick: function ( element ) {
        self.config.priorityPrint = -1;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      ignoreFullCheckboxOnChange: function ( element ) {
        self.config.ignoreFull = !self.config.ignoreFull;
      },

      ignore85ProcentCheckboxOnChange: function ( element ) {
        self.config.ignore85procent = !self.config.ignore85procent;
        self.handlers.modalSearchOnKeyUp( { key: 'Enter' }, true, false );
      },

      // handlers of sorting

      sortShopName: function () {
        console.debug( 'handler: sortShopName' ); // Debug

        let tableRowList = self.getters.getDataFromTable();

        if ( tableRowList )
        {
          self.config.sortDirectionShopName = !self.config.sortDirectionShopName;

          // true is ascending
          if ( self.config.sortDirectionShopName )
          {
            self.helpers.ordnen( tableRowList, 'shopName', self.helpers.updateTable );
          }
          else
          {
            self.helpers.ordnen( tableRowList, 'shopName', self.helpers.updateTable, self.helpers.sortDesc );
          }
        }
      },

      sortAddress: function () {
        console.debug( 'handler: sortAddress' ); // Debug

        let tableRowList = self.getters.getDataFromTable();

        if ( tableRowList )
        {
          self.config.sortDirectionAddress = !self.config.sortDirectionAddress;

          // true is ascending
          if ( self.config.sortDirectionAddress )
          {
            self.helpers.ordnen( tableRowList, 'address', self.helpers.updateTable );
          }
          else
          {
            self.helpers.ordnen( tableRowList, 'address', self.helpers.updateTable, self.helpers.sortDesc );
          }
        }
      },

      sortDistance: function () {
        console.debug( 'handler: sortDistance' ); // Debug

        let tableRowList = self.getters.getDataFromTable();

        if ( tableRowList )
        {
          self.config.sortDirectionDistance = !self.config.sortDirectionDistance;

          // true is ascending
          if ( self.config.sortDirectionDistance )
          {
            self.helpers.ordnen( tableRowList, 'distance', self.helpers.updateTable );
          }
          else
          {
            self.helpers.ordnen( tableRowList, 'distance', self.helpers.updateTable, self.helpers.sortDesc );
          }
        }
      },

      sortVacancy: function () {
        console.debug( 'handler: sortVacancy' ); // Debug

        let tableRowList = self.getters.getDataFromTable();

        if ( tableRowList )
        {
          self.config.sortDirectionVacancy = !self.config.sortDirectionVacancy;

          // true is ascending
          if ( self.config.sortDirectionVacancy )
          {
            self.helpers.ordnen( tableRowList, 'vacancy', self.helpers.updateTable );
          }
          else
          {
            self.helpers.ordnen( tableRowList, 'vacancy', self.helpers.updateTable, self.helpers.sortDesc );
          }
        }
      }
    };

    // методы для рендера
    this.renderers = {

      render: function ( template, params, callback ) {

        params = ( typeof params == 'object' ) ? params : {};
        template = template || '';
  
        return self.render(
          {
            href: '/templates/' + template + '.twig',
            base_path: self.params.path,
            v: self.get_version(),
            load: ( template ) => {

              let html = template.render( { data: params } );

              callback( html );
            }
          },

          params
        );
      },

      // рендер кнопки амо
      renderButton: function ( selector, id, text = 'button', color = 'blue', location = 'append' ) {
          const data = {
            id: id,
            class_name: self.selectors.colorBtn[ color ],
            text: text
          };

          self.renderers.render( "button", data, ( html ) => {
            $( selector )[ location ]( html );
          });

          /*добовляем к кнопкам отступ в 3 пикселя чтоб выровнять их, почему они изначально, ниже не нашёл причину*/
          $( '#' + id ).css( 'margin','0 0 3px 0' );
      },

      // рендер голубой кнопки амо
      renderBlueButton: function ( selector, id, text = 'button', location = 'append' ) {
        self.renderers.renderButton(selector, id, text, color = 'blue', location);
      },

      // рендер серой кнопки амо
      renderGreyButton: function ( selector, id, text = 'button', location = 'append' ) {
        self.renderers.renderButton(selector, id, text, color = 'grey', location);
      },

      // рендер кнопки доступные магазины
      renderAvailableShopsBtn: function () { // btn vorhandenen Märkte
          let selector = self.selectors.availableShopsBtnDefaultTab;
          let id = self.selectors.availableShopsBtnId;
          const text = 'Доступные магазины';
          const location = 'prepend';

          self.renderers.renderBlueButton(
              selector,
              id,
              text,
              location
          );

          selector = self.selectors.availableShopsBtnPresaleTab;
          id = self.selectors.availableShopsBtnPresaleId;
          self.renderers.renderBlueButton(
              selector,
              id,
              text,
              location
          );
      },

      modalWindow: {
        objModalWindow: null,

        show: function ( id, innerHTML, callback = false ) {
          let html = `
            <div class="widget_settings_block intr-widget_settings_block" style="position: absolute;">
              <div id="${id}" class="widget_settings_block__fields" style="margin-right: 35px; margin-bottom: 35px;">
                ${innerHTML}
              </div>
            </div>
          `;

          self.renderers.modalWindow.objModalWindow = new Modal(
            {
              class_name: `modal-window ${self.selectors.modalClass}`,

              init: function ( $modal_body ) {
                $modal_body
                  .css('overflow-x','auto')
                  .css('white-space','nowrap')
                  .css( 'padding-top', '5px' )
                  .width(`${self.config.modalWidth}px`)
                  .height(`${self.config.modalHeight}px`)
                  .append('<div style="width:1450px">'+html+'</div>')
                  .trigger('modal:loaded')
                  .trigger('modal:centrify');

                  if ( typeof callback == 'object' )
                  {
                    console.log( typeof callback );
                    callback.exec( callback.params );
                  }
              },

              destroy: function () {
                self.handlers.modalDestroyHandler();
              }
            }
          );
        },

        setData: function ( data ) {
          $( 'div.modal-body__inner__todo-types' ).append( data );
        },

        destroy: function ( save = false ) {
          this.objModalWindow.destroy();
        }
      },

      // рендер поле ввода
      renderInput: function ( selector, data ) { // FIXME
        self.renderers.render( 'input', data, html => {
          $( selector ).append( html );
        });
      },

      // рендер формы в модальном окне
      renderForm: function ( selector, employeeData = {} ) {
        // поле ввода адреса
        self.renderers.renderInput(
            `#${self.selectors.modalAddressId}-span`,
            {
                name: 'address',
                placeholder: 'Адрес соискателя',
                value: (employeeData) ? employeeData.address : null,
                type: 'text',
                id: self.selectors.modalAddressId,
            }
        );

        // добовляем ещё один атрибут к полю ввода адреса
        //$(`#${self.selectors.modalAddressId}`).css('width','45%');

        // поле ввода лимита расстояния
        self.renderers.renderInput(
            `#${self.selectors.modalLimitId}-span`,
            {
                name: 'limit',
                placeholder: 'Максимальное расстояние в км',
                value: (employeeData) ? String(employeeData.limit) + ' км' : '0 км',
                type: 'text',
                id: self.selectors.modalLimitId,
            }
        );

        // рендер кнопок для быстрого воода расстояния
        self.renderers.renderGreyButton(
            selector = `#${self.selectors.limitFastInput['3']}-span`,
            id = self.selectors.limitFastInput['3'],
            text = '3 км'
        );

        self.renderers.renderGreyButton(
            selector = `#${self.selectors.limitFastInput['5']}-span`,
            id = self.selectors.limitFastInput['5'],
            text = '5 км'
        );

        self.renderers.renderGreyButton(
            selector = `#${self.selectors.limitFastInput['10']}-span`,
            id = self.selectors.limitFastInput['10'],
            text = '10 км'
        );

        // рендер кнопки загрузить магазины
        self.renderers.renderBlueButton(
            selector = `#${self.selectors.loadShopsBtnId}-span`,
            id = self.selectors.loadShopsBtnId,
            text = 'Загрузить магазины'
        );

        // поле ввода фильтр по магазинам
        self.renderers.renderInput(
            `#${self.selectors.modalSearchShopsId}-span`,
            {
                name: 'search',
                placeholder: 'Фильтр по магазинам',
                type: 'text',
                id: self.selectors.modalSearchShopsId,
            }
        );

        // поле ввода фильтр по вакансиям
        self.renderers.renderInput(
            `#${self.selectors.modalSearchVacanciesId}-span`,
            {
                name: 'search-vacancies',
                placeholder: 'Фильтр по вакансиям',
                type: 'text',
                id: self.selectors.modalSearchVacanciesId,
            }
        );

        // рендер кнопки поиск
        self.renderers.renderGreyButton(
            selector = `#${self.selectors.searchBtnId}-span`,
            id = self.selectors.searchBtnId,
            text = 'Поиск'
        );

        // рендер кнопок с приоритетами
        self.renderers.renderGreyButton(
            selector = `#${self.selectors.priorityBtnId_1}-span`,
            id = self.selectors.priorityBtnId_1,
            text = 'Приоритет 1'
        );

        self.renderers.renderGreyButton(
            selector = `#${self.selectors.priorityBtnId_2}-span`,
            id = self.selectors.priorityBtnId_2,
            text = 'Приоритет 2'
        );

        self.renderers.renderGreyButton(
            selector = `#${self.selectors.priorityBtnId_3}-span`,
            id = self.selectors.priorityBtnId_3,
            text = 'Приоритет 3'
        );

        self.renderers.renderGreyButton(
            selector = `#${self.selectors.priorityBtnId_0}-span`,
            id = self.selectors.priorityBtnId_0,
            text = 'Без приоритета'
        );
        
        self.renderers.renderGreyButton(
          selector = `#${self.selectors.priorityBtnIdReset}-span`,
          id = self.selectors.priorityBtnIdReset,
          text = 'Сброс'
        );

        // рендер чекбокса 100%
        //self.renderers.renderIgnoreFullVacanciesCheckbox();

        // рендер чекбокса 85 %
        self.renderers.renderIgnore85ProcentVacanciesCheckbox();
      },

      renderTableHead: function ( selector, location = 'prepend' ) {
        let tableHeadData = {
          widgetPrefix: self.config.widgetPrefix
        };

        self.renderers.render( 'tableHead', tableHeadData, ( html ) => {
          $( selector )[ location ]( html );
        } );
      },

      renderTableBody: function ( selector, data, location = 'append', callback = false ) {
        let tableBodyData = {
          widgetPrefix: self.config.widgetPrefix,
          vacancies: data
        };

        self.renderers.render( 'tableBody', tableBodyData, ( html ) => {
          $( selector )[ location ]( html );

          if ( typeof callback == 'object' )
          {
            callback.exec( callback.params );
          }
        } );
      },

      renderBaseTable: function ( selector, callback ) {
        $( selector ).append( self.html.baseTable );

        self.renderers.renderTableHead( self.selectors.js.listTable );
      },

      // рендер таблицы по данным в табличном формате
      renderTable: function ( selector, data ) { // FIXME
          self.renderers.render('inner', data, html => { // FIXME inner.twig implementiren
              $(selector).append(html)
          });
      },

      // перерендерить таблицу
      reRenderTable: function ( renderSpinnerFlag = true, isPriority = false, sortFunction = self.helpers.nearToFarSort ) {
        console.debug( self.config.widgetsName + ' << [renderer] : reRenderTable' ); //Debug

          // порядок такой:
          // показать спиннер
          // взять данные соискателя
          // отправить запрос
          // получить данные
          // с данными составить таблицу
          // убрать старую таблицу
          // убрать спиннер
          // перерендериваем таблицу

          // показать спиннер
          //if ( renderSpinnerFlag ) self.renderers.renderSpinner( `.${self.selectors.modalClass}` );

          self.renderers.removeTable( self.selectors.js.tableRow );
          self.renderers.removeTable( self.selectors.js.tableRow_nichts );

          // без таймаута не работает
          setTimeout(
            function () {
              // взять данные соискателя
              let employeeData = self.getters.getEmployeeDataWithCoordinatesFromModal();

              console.debug("Отправлямые координаты");
              console.debug(employeeData);

              // send request
              // get data
              let shopsExportData = {
                "address" : employeeData.address,
                "limit" : employeeData.limit,
                "lead_id" : AMOCRM.data.current_card.id,
              };

              self.getters.getShopsData(
                shopsExportData,

                {
                  exec : self.helpers.showTable,
                  params : {
                    employeeData : employeeData,
                    sortFunction : sortFunction
                  }
                }
              );
            },

            500
          );

          // console.log('removeSpinner');
          // убрать спиннер
          // нужно сделать это второй раз, иначе не работает
          //self.renderers.removeSpinner(`#${self.selectors.modalId}`); // FIXME was soll das?!
      },

      // рендер чекбокса 100 %
      renderIgnoreFullVacanciesCheckbox: function () {
          data = {
              name: 'ignoreFullVacanciesCheckbox',
              text: 'Игнорировать вакансии с загрузкой 100%',
              checked: self.config.ignoreFull,
              id: self.selectors.ignoreFullCheckboxId,
          };
          self.renderers.render('/tmpl/controls/checkbox.twig', data, html => { // FIXME checkbox.twig implementieren
              $(`#${self.selectors.ignoreFullCheckboxId}-span`).append(html)
          });
      },

      // рендер чекбокса 85 %
      renderIgnore85ProcentVacanciesCheckbox: function () { // FIXME
          data = {
            name: 'ignore85ProcentVacanciesCheckbox',
            text: 'Игнорировать вакансии с загрузкой более 85%',
            checked: self.config.ignore85procent,
            id: self.selectors.ignore85ProcentCheckboxId,
          };
          self.renderers.render( 'checkbox', data, html => {
              $(`#${self.selectors.ignore85ProcentCheckboxId}-span`).append(html)
          });
      },


      // рендер спиннера body
      renderSpinner: function (selector = 'body') {
          $(selector).append('<div class="default-overlay list__overlay default-overlay-visible" id="page_change_loader"><span class="spinner-icon spinner-icon-abs-center"></span></div>');
      },

      // убрать спиннер body
      removeSpinner: function (selector = 'body') {
          $('#page_change_loader').remove();
      },

      // убрать таблицу
      removeTable: function ( selector ) {
        $( selector ).remove()
      },
    };

    this.callbacks = {

      render: function () {
        console.debug( self.config.widgetsName + ' << render:' ); //Debug

        self.settings = self.get_settings();

        if ( self.system().area === "lcard" )
        {
          self.renderers.renderAvailableShopsBtn();

          if ( self.config.isDev )
          {
            /****************** ЗАБИРАЕМ ИНФУ ПО КАСТОМНЫМ ПОЛЯМ И ИХ ЗНАЧЕНИЯМ ДЛЯ ТЕСТОВОГО АККАУНТА *****************/

            let test_all_vacancies_in_card = new Array(); // сюда запишутся текущий перечень вакансий
            let test_all_shops_in_card = new Array(); // сюда запишутся текущий перечень магазинов

            // собираем массив с айдишниками и наиминованиями должностей поле ЖЕЛАЕМАЯ ВАКАНСИЯ
            let test_tmp_client_vacancies = AMOCRM.constant( 'account' ).cf[ self.fieldsConfig.blackclevertech.desiredVacancy ][ 'ENUMS' ];

            Object.keys( test_tmp_client_vacancies ).forEach( function ( key ) {
              let currentVacancy = self.helpers.strToStandart( test_tmp_client_vacancies[ key ][ 'VALUE' ] );

              test_all_vacancies_in_card[ currentVacancy ] = Number( key );
            });

            self.fieldsConfig.blackclevertech.vacancies = test_all_vacancies_in_card;

            // собираем массив с айдишниками и наиминованиями магазинов поле КЛИЕНТ
            let test_tmp_shops_vacancies = AMOCRM.constant( 'account' ).cf[ self.fieldsConfig.blackclevertech.client ][ 'ENUMS' ];

            Object.keys( test_tmp_shops_vacancies ).forEach( function ( key ) {
              let currentShop = self.helpers.strToStandart( test_tmp_shops_vacancies[ key ][ 'VALUE' ] );

              test_all_shops_in_card[ currentShop ] = Number( key );
            });

            self.fieldsConfig.blackclevertech.shopNames = test_all_shops_in_card;

            self.config.fields = self.fieldsConfig.blackclevertech;
          }
          else
          {
            /****************** ЗАБИРАЕМ ИНФУ ПО КАСТОМНЫМ ПОЛЯМ И ИХ ЗНАЧЕНИЯМ ДЛЯ КЛИЕНТСКОГО АККАУНТА *****************/

            let all_vacancies_in_card = new Array(); // сюда запишутся текущий перечень вакансий
            let all_shops_in_card = new Array(); // сюда запишутся текущий перечень магазинов

            // собираем массив с айдишниками и наиминованиями должностей поле ЖЕЛАЕМАЯ ВАКАНСИЯ
            let tmp_client_vacancies = AMOCRM.constant( 'account' ).cf[ self.fieldsConfig.gigant.desiredVacancy ][ 'ENUMS' ];

            Object.keys( tmp_client_vacancies ).forEach( function ( key ) {
              let currentVacancy = self.helpers.strToStandart( tmp_client_vacancies[ key ][ 'VALUE' ] );

              all_vacancies_in_card[ currentVacancy ] = Number( key );
            });

            self.fieldsConfig.gigant.vacancies = all_vacancies_in_card;

            // собираем массив с айдишниками и наиминованиями магазинов поле КЛИЕНТ
            let tmp_shops_vacancies = AMOCRM.constant( 'account' ).cf[ self.fieldsConfig.gigant.client ][ 'ENUMS' ];

            Object.keys( tmp_shops_vacancies ).forEach( function ( key ) {
              let currentShop = self.helpers.strToStandart( tmp_shops_vacancies[ key ][ 'VALUE' ] );

              all_shops_in_card[ currentShop ] = Number( key );
            });

            self.fieldsConfig.gigant.shopNames = all_shops_in_card;

            self.config.fields = self.fieldsConfig.gigant;
          }
        }

        return true;
      },

      init: function () {
        console.debug( self.config.widgetsName + ' << init:' ); //Debug

        if ( !$( 'link[href="' + self.settings.path + '/style.css?v=' + self.settings.version +'"]' ).length )
        {
          $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );
        }

        return true;
      },

      bind_actions: function () {
        console.debug( self.config.widgetsName + ' << bind_actions:' ); //Debug

        if ( !document.NearestShops_bindAction )
        {
          console.debug( 'NearestShops_bindAction does not exist' ); // Debug

          document.NearestShops_bindAction = true;

          $( document ).on( 'click', `#${self.selectors.availableShopsBtnId}`, _.debounce ( self.handlers.availableShopsBtnOnClick, 1500 ) );
          $( document ).on( 'click', `#${self.selectors.availableShopsBtnPresaleId}`, _.debounce ( self.handlers.availableShopsBtnOnClick, 1500 ) );

          $( document ).on( 'click', `#${self.selectors.loadShopsBtnId}`, _.debounce ( self.handlers.loadShopsBtnOnClick, 1500 ) );

          $( document ).on( 'click', `#${self.selectors.limitFastInput[ '3' ]}`, self.handlers.fastInput3OnClick );
          $( document ).on( 'click', `#${self.selectors.limitFastInput[ '5' ]}`, self.handlers.fastInput5OnClick );
          $( document ).on( 'click', `#${self.selectors.limitFastInput[ '10' ]}`, self.handlers.fastInput10OnClick );
          $( document ).on( 'click', `.${self.selectors.clickableVacancyClass}`, self.handlers.vacancyNameOnClick );
          $( document ).on( 'click', `#${self.selectors.searchBtnId}`, _.debounce ( self.handlers.searchBtnOnClick, 1500 ) );

          // обработка клика по кнопкам приоритета
          $( document ).on( 'click', `#${self.selectors.priorityBtnId_0}`, _.debounce ( self.handlers.priorityBtnId_0_OnClick, 1500 ) );
          $( document ).on( 'click', `#${self.selectors.priorityBtnId_1}`, _.debounce ( self.handlers.priorityBtnId_1_OnClick, 1500 ) );
          $( document ).on( 'click', `#${self.selectors.priorityBtnId_2}`, _.debounce ( self.handlers.priorityBtnId_2_OnClick, 1500 ) );
          $( document ).on( 'click', `#${self.selectors.priorityBtnId_3}`, _.debounce ( self.handlers.priorityBtnId_3_OnClick, 1500 ) );
          $( document ).on( 'click', `#${self.selectors.priorityBtnIdReset}`, _.debounce ( self.handlers.priorityBtnIdResetOnClick, 1500 ) );

          $( document ).on( 'keyup', `#${self.selectors.modalSearchShopsId}`, self.handlers.modalSearchOnKeyUp );
          $( document ).on( 'keyup', `#${self.selectors.modalSearchVacanciesId}`, self.handlers.modalSearchOnKeyUp );

          $( document ).on( 'change', `#${self.selectors.modalLimitId}`, self.handlers.modalLimitOnChange );

          $( document ).on( 'change', `#${self.selectors.ignoreFullCheckboxId}`, self.handlers.ignoreFullCheckboxOnChange );
          $( document ).on( 'change', `#${self.selectors.ignore85ProcentCheckboxId}`, self.handlers.ignore85ProcentCheckboxOnChange );

          // events of sorting
          $( document ).on( 'click', 'div.js-sort_shopName', self.handlers.sortShopName );
          $( document ).on( 'click', 'div.js-sort_address', self.handlers.sortAddress );
          $( document ).on( 'click', 'div.js-sort_distance', self.handlers.sortDistance );
          $( document ).on( 'click', 'div.js-sort_vacancy', self.handlers.sortVacancy );
        }
        else
        {
          console.debug( 'NearestShops_bindAction exists' ); // Debug
        }

        return true;
      },

      settings: function () {
        console.debug( 'settings ' + self.config.widgetsName );
        return true;
      },

      onSave: function () {
        console.debug( 'onSave ' + self.config.widgetsName );
        return true;
      },

      destroy: function () {
        console.debug( 'destroy ' + self.config.widgetsName );
      },

      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
          console.debug( 'contacts ' + self.config.widgetsName );
        }
      },

      leads: {
        //select leads in list and clicked on widget name
        selected: function () {
          console.debug( 'leads ' + self.config.widgetsName );
        }
      },

      tasks: {
        //select taks in list and clicked on widget name
        selected: function () {
          console.debug( 'tasks ' + self.config.widgetsName );
        }
      },

      advancedSettings: function () {
        console.debug( 'advancedSettings ' + self.config.widgetsName );
        return true;
      },

      /**
       * Метод срабатывает, когда пользователь в конструкторе Salesbot размещает один из хендлеров виджета.
       * Мы должны вернуть JSON код salesbot'а
       *
       * @param handler_code - Код хендлера, который мы предоставляем. Описан в manifest.json, в примере равен handler_code
       * @param params - Передаются настройки виджета. Формат такой:
       * {
       *   button_title: "TEST",
       *   button_caption: "TEST",
       *   text: "{{lead.cf.10929}}",
       *   number: "{{lead.price}}",
       *   url: "{{contact.cf.10368}}"
       * }
       *
       * @return {{}}
       */
      onSalesbotDesignerSave: function ( handler_code, params ) {
        var salesbot_source = {
            question: [],
            require: []
          },
          button_caption = params.button_caption || "",
          button_title = params.button_title || "",
          text = params.text || "",
          number = params.number || 0,
          handler_template = {
            handler: "show",
            params: {
              type: "buttons",
              value: text + ' ' + number,
              buttons: [
                button_title + ' ' + button_caption,
              ]
            }
          };

        console.debug( params );

        salesbot_source.question.push(handler_template);

        return JSON.stringify([salesbot_source]);
      },
    };

    return this;
  };

  return CustomWidget;
});