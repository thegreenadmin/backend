require("custom-env").env(true);

const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const logger = require("../logger/logger");
const CommonController = require("./common.controller");

// USPS Web Tools API URLs
const addressValidationAPI =
  "https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=";
const rateCalculatorAPI =
  "https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=";
const getCityNameAPI =
  "https://secure.shippingapis.com/ShippingAPI.dll?API=CityStateLookup&XML=";

// USPS Web Tools API credentials
const username = process.env.USPS_USERNAME;
const password = process.env.USPS_PASSWORD;

// USPS Address Validation API
async function verifyAddress(address) {
  const stateAbbrevation = CommonController.getStateAbbreviationByName(
    address.state.state_name,
    address.state.country.country_name
  );
  const xml = `<AddressValidateRequest USERID="${username}">
                 <Address ID="0">
                    <Address1>${address.address_line_1}</Address1>
                    <Address2>${address.address_line_2}</Address2>
                    <City>${address.city}</City>
                    <State>${stateAbbrevation}</State>
                    <Zip5>${address.postal_code}</Zip5>
                    <Zip4></Zip4>
                 </Address>
               </AddressValidateRequest>`;

  try {
    const response = await axios.get(addressValidationAPI + encodeURI(xml));
    const result = await parseStringPromise(response.data);
    const { Address } = result.AddressValidateResponse;
    const { Error } = Address[0];

    if (Error) {
      return {
        result: false,
        error: Error[0].Description[0],
      };
    } else {
      return {
        result: true,
      };
    }
  } catch (error) {
    return {
      result: false,
      error: error.message,
    };
  }
}

// USPS Delivery Charge Calculation API
async function calculateShippingCost(origin_code, destination_code, weight) {
  const xml = `<RateV4Request USERID="${username}">
                 <Revision>2</Revision>
                 <Package ID="0">
                    <Service> PRIORITY </Service>
                    <ZipOrigination>${origin_code}</ZipOrigination>
                    <ZipDestination>${destination_code}</ZipDestination>
                    <Pounds>${weight * 0.0625}</Pounds>
                    <Ounces>${weight}</Ounces>
                    <Container>RECTANGULAR</Container>
                    <Machinable>TRUE</Machinable>
                 </Package>
               </RateV4Request>`;

  try {
    const response = await axios.get(rateCalculatorAPI + encodeURI(xml));
    const result = await parseStringPromise(response.data);
    const { Package } = result.RateV4Response;
    const { Error } = Package[0];

    if (Error) {
      // Handle rate calculation error
      return {
        result: false,
        error: Error[0].Description[0],
      };
    } else {
      const { Postage } = Package[0];
      const rates = Postage.map((item) => ({
        service: item.MailService[0],
        rate: item.Rate[0],
      }));
      return {
        result: true,
        rate: rates[0].rate,
      };
    }
  } catch (error) {
    return {
      result: false,
      error: error.message,
    };
  }
}

async function getCityFromPostalCode(postal_code) {
  const xml = `<CityStateLookupRequest USERID="${username}">
                <ZipCode>
                    <Zip5>${postal_code}</Zip5>
                </ZipCode>
              </CityStateLookupRequest>`;
  try {
    const response = await axios.get(getCityNameAPI + encodeURI(xml));
    const result = await parseStringPromise(response.data);
    const { ZipCode } = result.CityStateLookupResponse;
    const { Error } = ZipCode[0];

    if (Error) {
      return {
        result: false,
        error: Error[0].Description[0],
      };
    }

    return {
      result: true,
      city: ZipCode[0].City[0],
    };
  } catch (err) {
    return {
      result: false,
      error: err.message,
    };
  }
}

const getLatLongUsingZip = async function (zipCode, address) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}, ${zipCode}&key=${apiKey}`;

    const response = await axios.get(url);
    const { data } = response;

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;
      return {
        result: true,
        latitude,
        longitude,
      };
    } else {
      return {
        result: false,
        error: "Geolocation not found",
      };
    }
  } catch (err) {
    throw err;
  }
};

const getAddressUsingLatLong = async function (latitude, longitide) {
  try {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitide}`;
    const response = await axios.get(apiUrl);
    return {
      result: true,
      address: response.data.address,
      full_address: response.data.display_name,
    };
  } catch (err) {
    return {
      result: false,
    };
  }
};

function extractComponentValue(result, componentType) {
  const component = result.address_components.find((comp) =>
    comp.types.includes(componentType)
  );
  return component ? component.long_name : null;
}

const getGeoParametersByPostalCode = async function (postalCode) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    const queryVariants = [
      { address: `${postalCode}` },
      { address: `${postalCode},US` },
      { address: `${postalCode}`, components: "country:US" },
    ];

    for (const query of queryVariants) {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            ...query,
            key: apiKey,
          },
        }
      );

      const data = response.data;
      if (data.status === "OK" && data.results?.length) {
        const location = data.results[0].geometry.location;
        return {
          result: true,
          latitude: location.lat || null,
          longitude: location.lng || null,
        };
      }
    }

    return {
      result: false,
      error: "Geolocation not found",
    };
  } catch (err) {
    return {
      result: false,
      error: err.message,
    };
  }
};
const getGeoParametersByPlaceId = async function (placeId) {
  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

  const response = await axios.get(url);
  const { data } = response;
  if (data.status === "OK") {
    const result = data.result;
    const postalCodeRegex = /\b\d{5}\b/;
    const pc = result?.formatted_address.match(postalCodeRegex);
    const addressLine1 =
      extractComponentValue(result, "street_number") ||
      extractComponentValue(result, "route");
    const addressLine2 = extractComponentValue(result, "address_line_2");

    const zipCode =
      addressLine1 || addressLine2
        ? null
        : extractComponentValue(result, "postal_code");

    const city = zipCode ? null : extractComponentValue(result, "locality");
    const state = extractComponentValue(result, "administrative_area_level_1");
    const country = extractComponentValue(result, "country");
    const latitude = result.geometry?.location.lat || null;
    const longitude = result.geometry?.location.lng || null;

    return {
      result: true,
      city,
      state,
      country,
      postal_code: Number(pc),
      latitude,
      longitude,
    };
  } else {
    return {
      result: false,
      error: "Geolocation not found",
    };
  }
};

module.exports = {
  verifyAddress,
  calculateShippingCost,
  getCityFromPostalCode,
  getLatLongUsingZip,
  getAddressUsingLatLong,
  getGeoParametersByPlaceId,
  getGeoParametersByPostalCode,
};
