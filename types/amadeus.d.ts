declare module 'amadeus' {
  export default class Amadeus {
    constructor(options: { clientId: string, clientSecret: string });
    
    referenceData: {
      locations: {
        hotels: {
          byCity: {
            get(params: any): Promise<any>;
          };
        };
      };
    };
    
    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<any>;
      };
      hotelOffersSearch: {
        get(params: any): Promise<any>;
      };
    };
  }
}