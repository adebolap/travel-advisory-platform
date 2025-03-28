import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plane, 
  UtensilsCrossed, 
  Music, 
  Calendar, 
  Users, 
  DollarSign, 
  Umbrella, 
  Thermometer
} from "lucide-react";
import { format, parseISO, isValid, getMonth, getYear, addMonths } from "date-fns";

interface Season {
  name: string;
  months: number[];
}

interface SeasonalFactor {
  season: string;
  flights: {
    demand: 'Low' | 'Moderate' | 'High' | 'Peak';
    prices: 'Budget-friendly' | 'Moderate' | 'Expensive' | 'Premium';
    availability: 'Abundant' | 'Good' | 'Limited' | 'Very limited';
    notes: string;
  };
  food: {
    specialties: string[];
    experiences: string[];
    prices: 'Budget-friendly' | 'Moderate' | 'Expensive' | 'Peak season' | 'Premium';
    notes: string;
  };
  nightlife: {
    activity: 'Quiet' | 'Moderate' | 'Lively' | 'Vibrant';
    events: string[];
    crowd: 'Local' | 'Mixed' | 'Tourist-heavy';
    notes: string;
  };
  crowds: {
    level: 'Low' | 'Moderate' | 'High' | 'Peak' | 'Mixed';
    attractions: string;
    wait: string;
  };
}

interface SeasonalExpectationsProps {
  city: string;
  startDate?: string;
  endDate?: string;
  className?: string;
}

const seasons: Season[] = [
  { name: "Winter", months: [12, 1, 2] },
  { name: "Spring", months: [3, 4, 5] },
  { name: "Summer", months: [6, 7, 8] },
  { name: "Fall", months: [9, 10, 11] }
];

// Helper function to determine season from date
const getSeasonFromDate = (dateStr?: string): string => {
  if (!dateStr) return "Unknown";
  
  const date = parseISO(dateStr);
  if (!isValid(date)) return "Unknown";
  
  const month = getMonth(date) + 1; // JavaScript months are 0-indexed
  
  for (const season of seasons) {
    if (season.months.includes(month)) {
      return season.name;
    }
  }
  
  return "Unknown";
};

// Function to get data about a city's seasonal factors
const getSeasonalData = (city: string, season: string): SeasonalFactor => {
  // Default data structure
  const defaultData: SeasonalFactor = {
    season,
    flights: {
      demand: 'Moderate',
      prices: 'Moderate',
      availability: 'Good',
      notes: 'Regular flight schedules operate throughout the year.'
    },
    food: {
      specialties: ['Local cuisine'],
      experiences: ['Outdoor dining', 'Food markets'],
      prices: 'Moderate',
      notes: 'Many restaurants and cafes are open year-round.'
    },
    nightlife: {
      activity: 'Moderate',
      events: ['Local music', 'Cultural events'],
      crowd: 'Mixed',
      notes: 'Nightlife options available throughout the year.'
    },
    crowds: {
      level: 'Moderate',
      attractions: 'Most attractions are open with standard hours.',
      wait: 'Expect average wait times at popular attractions.'
    }
  };

  // City-specific seasonal data based on research
  const cityData: Record<string, Record<string, SeasonalFactor>> = {
    "Barcelona": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Good',
          notes: 'Popular time to visit with good weather; book 2-3 months ahead.'
        },
        food: {
          specialties: ['Spring vegetables', 'Seafood paella', 'Fresh tapas', 'Calçots'],
          experiences: ['Outdoor dining', 'Waterfront restaurants', 'Food markets'],
          prices: 'Moderate',
          notes: 'Many restaurants offer spring specials with seasonal ingredients.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Spring festivals', 'Live music events', 'Outdoor parties'],
          crowd: 'Mixed',
          notes: 'Weather gets warm enough for outdoor nightlife and beach parties.'
        },
        crowds: {
          level: 'High',
          attractions: 'Sagrada Familia and Park Güell get increasingly crowded.',
          wait: 'Lines begin forming at major attractions; advance tickets recommended.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Highest tourist season; book 4-5 months ahead for best rates.'
        },
        food: {
          specialties: ['Cold gazpacho', 'Grilled seafood', 'Ice cream', 'Summer fruits'],
          experiences: ['Beachside dining', 'Rooftop restaurants', 'Food festivals'],
          prices: 'Peak season',
          notes: 'Authentic places fill up quickly; tourist areas charge premium prices.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Beach parties', 'Music festivals', 'Neighborhood feasts'],
          crowd: 'Tourist-heavy',
          notes: 'The city comes alive at night with clubs open until dawn and beach parties.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Extremely crowded everywhere, especially beaches and Gaudi sites.',
          wait: 'Very long lines; advance tickets essential for all major attractions.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Pleasant shoulder season with reasonable airfares after summer peak.'
        },
        food: {
          specialties: ['Mushroom dishes', 'Roasted vegetables', 'Hearty stews', 'Wine harvests'],
          experiences: ['Wine tastings', 'Food markets', 'Traditional restaurants'],
          prices: 'Moderate',
          notes: 'Excellent time for food lovers with harvest-inspired menus.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Cultural festivals', 'Independent music scenes', 'Art events'],
          crowd: 'Mixed',
          notes: 'Good balance of tourists and locals; more authentic experience.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Manageable crowds at most attractions.',
          wait: 'Shorter lines than summer; weekends still busy.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'Except for Christmas/New Year and Mobile World Congress, winter offers best deals.'
        },
        food: {
          specialties: ['Hot chocolate', 'Churros', 'Catalan winter stews', 'Holiday specialties'],
          experiences: ['Christmas markets', 'Cozy tapas bars', 'Winter food festivals'],
          prices: 'Budget-friendly',
          notes: 'Many restaurants offer winter specials and set menus.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Christmas celebrations', 'Three Kings parade', 'Indoor music venues'],
          crowd: 'Local',
          notes: 'More low-key with locals; Christmas period is festive and busy.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Minimal crowds at most sites except during holidays.',
          wait: 'Short or no lines at major attractions; some reduced winter hours.'
        }
      }
    },
    "Amsterdam": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Tulip season (mid-March to early May) is extremely popular; book 3-4 months ahead.'
        },
        food: {
          specialties: ['Spring herring', 'Asparagus dishes', 'Seasonal beers', 'Dutch cheeses'],
          experiences: ['Canal-side dining', 'Food markets', 'Outdoor cafés'],
          prices: 'Expensive',
          notes: 'Specialty tulip season menus and spring flavors are featured everywhere.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Kings Day celebrations', 'Spring festivals', 'Outdoor concerts'],
          crowd: 'Tourist-heavy',
          notes: 'Vibrant atmosphere with major events, especially Kings Day (April 27).'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Very crowded, especially museums, Keukenhof gardens, and canal tours.',
          wait: 'Long lines everywhere; advance booking essential during tulip season.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Peak tourist season; book flights 2-3 months ahead.'
        },
        food: {
          specialties: ['Fresh seafood', 'Seasonal fruit pies', 'Outdoor grill dishes', 'Ice cream'],
          experiences: ['Outdoor dining', 'Food festivals', 'Canal-side restaurants'],
          prices: 'Expensive',
          notes: 'Busy restaurant scene with emphasis on outdoor dining.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Summer festivals', 'Outdoor concerts', 'Canal festivals'],
          crowd: 'Tourist-heavy',
          notes: 'Lively atmosphere with extended daylight hours; many outdoor events.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very crowded throughout the city, especially museums and popular areas.',
          wait: 'Long lines at major museums; advance tickets highly recommended.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Pleasant shoulder season with better deals after summer crowds.'
        },
        food: {
          specialties: ['Dutch stews', 'Wild game', 'Mushroom dishes', 'Apple desserts'],
          experiences: ['Cozy cafés', 'Specialty food events', 'Indoor food halls'],
          prices: 'Moderate',
          notes: 'Comfort foods appear on menus; good time for culinary experiences.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Cultural festivals', 'Museum Night', 'Indoor concerts'],
          crowd: 'Mixed',
          notes: 'Good balance of tourists and locals; active cultural calendar.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Good access to attractions with reasonable crowds.',
          wait: 'Shorter lines at major museums; weekends still busy.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'December is busy with Christmas markets; January/February offer best deals.'
        },
        food: {
          specialties: ['Erwtensoep (pea soup)', 'Stamppot', 'Dutch donuts', 'Hot chocolate'],
          experiences: ['Cozy brown cafés', 'Winter food markets', 'Ice skating rinks with food'],
          prices: 'Moderate',
          notes: 'Hearty winter specialties; cozy indoor dining experiences.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Amsterdam Light Festival', 'New Year celebrations', 'Indoor music venues'],
          crowd: 'Mixed',
          notes: 'Festive atmosphere during holiday season and Light Festival.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Busy during Christmas markets and Light Festival; quieter in January/February.',
          wait: 'Moderate lines during holiday events; minimal at other times.'
        }
      }
    },
    "Dubai": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Last chance for comfortable weather before extreme summer heat; book 2-3 months ahead.'
        },
        food: {
          specialties: ['Seafood', 'International cuisine', 'Outdoor brunch experiences'],
          experiences: ['Outdoor dining', 'Desert dining experiences', 'Waterfront restaurants'],
          prices: 'Expensive',
          notes: 'Excellent outdoor dining weather; many high-end restaurants feature spring menus.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Music festivals', 'Beach clubs', 'Rooftop parties'],
          crowd: 'Tourist-heavy',
          notes: 'Perfect weather for outdoor nightlife; beach clubs and rooftop venues are popular.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very busy at all major attractions and malls.',
          wait: 'Long lines at Burj Khalifa and other popular sites; advance tickets recommended.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'Low season due to extreme heat; best flight deals of the year.'
        },
        food: {
          specialties: ['Indoor buffets', 'Cooling dishes', 'International cuisine'],
          experiences: ['Luxury hotel dining', 'Indoor air-conditioned venues', 'Late-night dining'],
          prices: 'Budget-friendly',
          notes: 'Many summer dining deals and promotions; Dubai Summer Surprises festival.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Indoor club events', 'Hotel parties', 'Limited outdoor events'],
          crowd: 'Local',
          notes: 'Nightlife moves indoors due to heat; many special summer promotions.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Much less crowded; indoor attractions like malls are busier.',
          wait: 'Minimal waiting at most attractions; best time to avoid crowds.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Tourism picks up as temperatures cool; book 2-3 months ahead.'
        },
        food: {
          specialties: ['Outdoor dining returns', 'Seasonal specialties', 'Food festivals'],
          experiences: ['Beachside restaurants', 'Outdoor markets', 'Desert dining'],
          prices: 'Expensive',
          notes: 'Outdoor dining becomes popular again; restaurant scene very active.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Outdoor concerts', 'Beach parties', 'Rooftop events'],
          crowd: 'Mixed',
          notes: 'Nightlife moves outdoors again; many new seasonal venues open.'
        },
        crowds: {
          level: 'High',
          attractions: 'Increasing crowds at all attractions as high season begins.',
          wait: 'Growing lines at major attractions; advance booking advised.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Very limited',
          notes: 'Peak tourist season with perfect weather; book 4-5 months ahead.'
        },
        food: {
          specialties: ['Al fresco dining', 'International cuisine', 'Holiday specialties'],
          experiences: ['Outdoor dining', 'Desert camps', 'Friday brunches'],
          prices: 'Premium',
          notes: 'Restaurants are extremely busy; reservation essential for good venues.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['New Year celebrations', 'Major concerts', 'Outdoor festivals'],
          crowd: 'Tourist-heavy',
          notes: 'Most active nightlife season; prestigious events and celebrity appearances.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Extremely crowded everywhere, especially during holiday periods.',
          wait: 'Very long waits for all attractions; advance tickets essential.'
        }
      }
    },
    "Paris": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Good',
          notes: 'Spring is popular for Paris travel; book flights 3-4 months in advance.'
        },
        food: {
          specialties: ['Fresh asparagus dishes', 'Strawberry pastries', 'Spring lamb'],
          experiences: ['Outdoor cafés along the Seine', 'Picnics in blooming gardens'],
          prices: 'Moderate',
          notes: 'Seasonal spring menus appear with fresh local ingredients.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Spring festivals', 'Fashion events', 'Open-air concerts'],
          crowd: 'Mixed',
          notes: 'Longer days mean extended evening activities and outdoor events.'
        },
        crowds: {
          level: 'High',
          attractions: 'All major attractions open with extended spring hours.',
          wait: 'Moderate to long waits at popular sites like the Eiffel Tower and Louvre.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Peak tourist season with highest prices; book 5-6 months ahead.'
        },
        food: {
          specialties: ['Chilled soups', 'Fresh salads', 'Ice cream', 'Summer fruits'],
          experiences: ['Night markets', 'Riverside dining', 'Rooftop restaurants'],
          prices: 'Peak season',
          notes: 'Restaurants in tourist areas charge premium prices; many locals leave in August.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Bastille Day celebrations', 'Paris Plages', 'Open-air cinema'],
          crowd: 'Tourist-heavy',
          notes: 'Lively atmosphere with late sunsets allowing for extended evening activities.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'All attractions open but extremely crowded.',
          wait: 'Very long waits; advance tickets essential for all major sites.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Shoulder season with better deals after summer peak.'
        },
        food: {
          specialties: ['Wild game', 'Mushroom dishes', 'Hot chocolate', 'Chestnuts'],
          experiences: ['Wine tastings', 'Indoor cozy bistros', 'Food festivals'],
          prices: 'Moderate',
          notes: 'Wonderful time for food lovers with fall harvest specialties.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Jazz festivals', 'Fashion week', 'Art exhibitions'],
          crowd: 'Mixed',
          notes: 'Cultural season begins with many new exhibitions and performances.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Good access to attractions with reasonable crowds.',
          wait: 'Shorter lines except during special exhibitions.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'Except for Christmas/New Year period, winter offers the best flight deals.'
        },
        food: {
          specialties: ['French onion soup', 'Cassoulet', 'Hot pastries', 'Chocolate treats'],
          experiences: ['Cozy cafés', 'Christmas markets', 'Fondue restaurants'],
          prices: 'Budget-friendly',
          notes: 'Many restaurants offer winter specials and prix-fixe menus.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Christmas light shows', 'New Year celebrations', 'Winter festivals'],
          crowd: 'Local',
          notes: 'More intimate atmosphere with fewer tourists except during holidays.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Shorter winter hours at some attractions but minimal crowds.',
          wait: 'Minimal wait times at most attractions; some seasonal closures.'
        }
      }
    },
    "London": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Good',
          notes: 'Popular travel period; book flights 2-3 months ahead.'
        },
        food: {
          specialties: ['Spring lamb', 'Seasonal pies', 'Asparagus dishes'],
          experiences: ['Afternoon tea in blooming gardens', 'Farmers markets'],
          prices: 'Moderate',
          notes: 'Pub gardens begin to open; food festivals start in late spring.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Live music in pubs', 'Spring theater season', 'Cultural festivals'],
          crowd: 'Mixed',
          notes: 'Longer evenings mean extended hours for outdoor activities.'
        },
        crowds: {
          level: 'High',
          attractions: 'All attractions open with extended hours.',
          wait: 'Busier than winter but manageable with planning.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Book 4-5 months ahead; highest prices of the year.'
        },
        food: {
          specialties: ['Pimm\'s cups', 'Strawberries & cream', 'Seafood', 'Picnic fare'],
          experiences: ['Street food markets', 'Rooftop dining', 'Beer gardens'],
          prices: 'Expensive',
          notes: 'Outdoor dining everywhere; food festivals throughout summer.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Major music festivals', 'Outdoor cinema', 'Late-night museum events'],
          crowd: 'Tourist-heavy',
          notes: 'Extended hours for many venues; some locals leave the city in August.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Maximum crowds; advance booking essential.',
          wait: 'Long queues at major attractions; book skip-the-line tickets.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Good deals after summer peak; book 6-8 weeks ahead.'
        },
        food: {
          specialties: ['Sunday roasts', 'Game dishes', 'Warming pies', 'Apple desserts'],
          experiences: ['Food halls', 'Cozy pubs with fireplaces', 'Autumn food festivals'],
          prices: 'Moderate',
          notes: 'Seasonal menus feature comforting autumn fare.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Theater premieres', 'Halloween events', 'Film festivals'],
          crowd: 'Mixed',
          notes: 'Cultural calendar is busy; good mix of locals and tourists.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Good balance of access and crowds.',
          wait: 'Shorter lines at major attractions except on weekends.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'January/February offer best deals (except Christmas/New Year).'
        },
        food: {
          specialties: ['Christmas pudding', 'Mince pies', 'Mulled wine', 'Hearty stews'],
          experiences: ['Christmas markets', 'Festive afternoon teas', 'Cozy historic pubs'],
          prices: 'Budget-friendly',
          notes: 'Many restaurants offer winter deals after holiday season.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Christmas lights', 'New Year fireworks', 'Winter festivals'],
          crowd: 'Local',
          notes: 'Cozy indoor venues; festive spirit during holiday season.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Quietest period except for holiday weeks.',
          wait: 'Minimal waits at most attractions outside holiday periods.'
        }
      }
    },
    "Rome": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Good',
          notes: 'Popular time to visit; Easter can see price spikes.'
        },
        food: {
          specialties: ['Artichoke dishes', 'Spring lamb', 'Fresh pasta with seasonal vegetables'],
          experiences: ['Outdoor dining in historic squares', 'Food tours in pleasant weather'],
          prices: 'Moderate',
          notes: 'Many restaurants feature special spring menus with seasonal ingredients.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Spring festivals', 'Outdoor concerts', 'Cultural events'],
          crowd: 'Mixed',
          notes: 'Perfect weather for evening walks and outdoor aperitivo.'
        },
        crowds: {
          level: 'High',
          attractions: 'All major sites open with increasing crowds as season progresses.',
          wait: 'Long lines at major attractions; advance tickets recommended.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Highest prices of year; book 4-5 months ahead.'
        },
        food: {
          specialties: ['Gelato', 'Cold pasta dishes', 'Fresh fruits', 'Seafood'],
          experiences: ['Late-night dining', 'Rooftop restaurants', 'Evening food festivals'],
          prices: 'Peak season',
          notes: 'Many locals leave in August; tourist restaurants may charge premium prices.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Summer festivals', 'Outdoor cinema', 'Concert series'],
          crowd: 'Tourist-heavy',
          notes: 'Hot weather pushes activities later into evening; outdoor events throughout the night.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Extremely crowded; advance tickets essential.',
          wait: 'Very long waits; early morning or evening visits recommended.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Pleasant shoulder season with better deals.'
        },
        food: {
          specialties: ['Truffle dishes', 'Wild mushrooms', 'Harvest vegetables', 'New wine'],
          experiences: ['Wine tastings', 'Food festivals', 'Harvest celebrations'],
          prices: 'Moderate',
          notes: 'Excellent time for food lovers with autumn specialties.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Film festivals', 'Jazz nights', 'Cultural events'],
          crowd: 'Mixed',
          notes: 'Comfortable temperatures for evening activities; good mix of locals and tourists.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Good access with manageable crowds.',
          wait: 'Reasonable wait times at major attractions.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'January/February offer best deals (except Christmas/New Year).'
        },
        food: {
          specialties: ['Carbonara', 'Hearty pasta dishes', 'Winter soups', 'Holiday treats'],
          experiences: ['Christmas markets', 'Cozy trattorias', 'Winter food festivals'],
          prices: 'Budget-friendly',
          notes: 'Many restaurants offer winter specials; authentic local experience.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Christmas celebrations', 'New Year events', 'Opera season'],
          crowd: 'Local',
          notes: 'More authentic local experience with fewer tourists.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Minimal crowds except during Christmas and New Year.',
          wait: 'Short or no lines at most attractions; some reduced winter hours.'
        }
      }
    },
    "New York": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Good',
          notes: 'Popular time to visit; book 2-3 months ahead.'
        },
        food: {
          specialties: ['Spring vegetables', 'Farmers market finds', 'Artisanal ice cream'],
          experiences: ['Outdoor dining', 'Food festivals', 'Rooftop brunches'],
          prices: 'Expensive',
          notes: 'Restaurant week offers in late spring; seasonal menus change.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Broadway shows', 'Spring festivals', 'Outdoor concerts'],
          crowd: 'Mixed',
          notes: 'Comfortable weather allows for bar hopping and outdoor events.'
        },
        crowds: {
          level: 'High',
          attractions: 'All attractions open; crowds build as weather improves.',
          wait: 'Long lines at major attractions; advance tickets recommended.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Book 3-4 months ahead; slightly lower demand than spring/fall.'
        },
        food: {
          specialties: ['Gourmet ice cream', 'Seafood', 'Food truck specialties'],
          experiences: ['Open-air food markets', 'Rooftop dining', 'Street food festivals'],
          prices: 'Expensive',
          notes: 'Many locals leave on weekends; restaurant deals available in August.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Outdoor concerts', 'Rooftop parties', 'Shakespeare in the Park'],
          crowd: 'Tourist-heavy',
          notes: 'Hot weather but vibrant outdoor nightlife and events throughout the city.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very crowded but slightly less than spring/fall.',
          wait: 'Long lines; early morning visits recommended.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Most popular season; book 4-5 months ahead.'
        },
        food: {
          specialties: ['Pumpkin dishes', 'Apple cider', 'Fall harvest menus'],
          experiences: ['Food and wine festivals', 'Farm-to-table dining', 'Food tours'],
          prices: 'Expensive',
          notes: 'Restaurant week offers; spectacular seasonal menus.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Fashion Week', 'Film Festival', 'Halloween Parade'],
          crowd: 'Mixed',
          notes: 'Perfect weather for nightlife; cultural season in full swing.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Maximum crowds, especially for fall foliage in Central Park.',
          wait: 'Very long waits; advance tickets essential.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'January/February offer deals (except Christmas/New Year).'
        },
        food: {
          specialties: ['Hot chocolate', 'Comfort food', 'Holiday treats', 'Winter cocktails'],
          experiences: ['Cozy restaurants with fireplaces', 'Holiday markets', 'Indoor food halls'],
          prices: 'Moderate',
          notes: 'Restaurant Week in January offers great deals.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Christmas spectaculars', 'New Year celebrations', 'Winter jazz festivals'],
          crowd: 'Mixed',
          notes: 'Indoor venues bustle; Holiday season extremely busy and festive.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Very busy during holidays, quieter in January/February.',
          wait: 'Shorter lines in January/February; holiday period extremely crowded.'
        }
      }
    },
    "Tokyo": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'Cherry blossom season (late March-early April) is the busiest time; book 5-6 months ahead.'
        },
        food: {
          specialties: ['Sakura-themed treats', 'Spring vegetables', 'Seasonal bento boxes'],
          experiences: ['Hanami (cherry blossom) picnics', 'Spring food festivals', 'Outdoor markets'],
          prices: 'Expensive',
          notes: 'Special spring menus everywhere; premium prices during cherry blossom season.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Cherry blossom viewing parties', 'Spring festivals', 'Cultural performances'],
          crowd: 'Tourist-heavy',
          notes: 'Festive atmosphere; extended hours at many venues during peak season.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Extremely crowded during cherry blossom season.',
          wait: 'Very long waits at popular sites; advance tickets essential.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Hot and humid; slightly lower demand except during Olympics/special events.'
        },
        food: {
          specialties: ['Cold noodles', 'Shaved ice desserts', 'Summer festival foods'],
          experiences: ['Beer gardens', 'Rooftop dining', 'Summer food festivals'],
          prices: 'Moderate',
          notes: 'Special summer menus focus on cooling foods.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Summer festivals (matsuri)', 'Fireworks displays', 'Beer gardens'],
          crowd: 'Mixed',
          notes: 'Evening activities popular due to daytime heat; many traditional festivals.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Busy but not peak; indoor attractions especially crowded (for air conditioning).',
          wait: 'Moderate lines; early morning visits recommended to avoid heat.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Popular for autumn foliage; book 3-4 months ahead.'
        },
        food: {
          specialties: ['Matsutake mushrooms', 'Autumn fish', 'Sweet potatoes', 'Seasonal kaiseki'],
          experiences: ['Food and sake festivals', 'Traditional tea houses', 'Autumn harvests'],
          prices: 'Expensive',
          notes: 'Excellent season for gourmet experiences; special autumn menus.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Autumn festivals', 'Illumination events', 'Art exhibitions'],
          crowd: 'Mixed',
          notes: 'Comfortable temperatures make for pleasant evening activities.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very busy, especially at autumn foliage spots.',
          wait: 'Long lines at popular autumn viewing locations; advance tickets recommended.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'January/February offer best deals (except New Year period).'
        },
        food: {
          specialties: ['Hot pot dishes', 'Ramen', 'Winter street food', 'Seasonal seafood'],
          experiences: ['Indoor food markets', 'Traditional winter cuisine', 'Hot sake tastings'],
          prices: 'Budget-friendly',
          notes: 'Good value except during New Year period; warming winter specialties.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Winter illuminations', 'New Year celebrations', 'Winter festivals'],
          crowd: 'Local',
          notes: 'New Year period extremely busy; otherwise more local experience.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Minimal crowds except during New Year week.',
          wait: 'Short or no lines at most attractions; some reduced winter hours.'
        }
      }
    },
    "Brussels": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Pleasant time to visit with increasing flight options.'
        },
        food: {
          specialties: ['White asparagus dishes', 'Spring lamb', 'Belgian strawberries'],
          experiences: ['Outdoor cafés', 'Seasonal beer releases', 'Chocolate shops'],
          prices: 'Moderate',
          notes: 'Fresh spring ingredients appear on menus; outdoor dining begins.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Spring jazz festivals', 'Cultural events', 'Beer festivals'],
          crowd: 'Mixed',
          notes: 'Pleasant evenings for exploring the city bar scene.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'All attractions open with moderate crowds.',
          wait: 'Reasonable wait times at major attractions.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Peak tourist season; book 2-3 months ahead.'
        },
        food: {
          specialties: ['Mussels', 'Fresh seafood', 'Summer fruits', 'Artisanal ice cream'],
          experiences: ['Outdoor markets', 'Food truck festivals', 'Alfresco dining'],
          prices: 'Expensive',
          notes: 'Busy restaurant scene; outdoor seating premium in good weather.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Summer festivals', 'Outdoor concerts', 'Cultural celebrations'],
          crowd: 'Tourist-heavy',
          notes: 'Late sunset allows for extended evening activities; lively atmosphere.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very crowded, especially Grand Place and main museums.',
          wait: 'Long lines at popular attractions; advance tickets recommended.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Pleasant shoulder season with reasonable airfares.'
        },
        food: {
          specialties: ['Game dishes', 'Mushroom specialties', 'Autumn beers', 'Comfort food'],
          experiences: ['Beer tastings', 'Cozy bistros', 'Chocolate shops'],
          prices: 'Moderate',
          notes: 'Excellent time for Belgian culinary experiences.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Film festivals', 'Art events', 'Beer celebrations'],
          crowd: 'Mixed',
          notes: 'Good balance of tourists and locals; cozy bar atmosphere.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Good access with reasonable crowds.',
          wait: 'Shorter lines at major attractions.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'Christmas markets increase demand in December; January/February offer best deals.'
        },
        food: {
          specialties: ['Belgian waffles', 'Hot chocolate', 'Hearty stews', 'Christmas treats'],
          experiences: ['Christmas markets', 'Cozy cafés', 'Chocolate workshops'],
          prices: 'Budget-friendly',
          notes: 'Winter comfort food prevalent; special holiday menus in December.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Christmas light displays', 'Winter festivals', 'New Year celebrations'],
          crowd: 'Local',
          notes: 'Cozy bar scene; festive atmosphere during holiday season.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Busy during Christmas markets; quiet in January/February.',
          wait: 'Short lines in January/February; longer during December events.'
        }
      }
    },
    "Singapore": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'Weather is hot and humid year-round; March-May tend to be slightly less rainy.'
        },
        food: {
          specialties: ['Chili crab', 'Hainanese chicken rice', 'Laksa', 'Seafood dishes'],
          experiences: ['Hawker centers', 'High-end restaurants', 'Food festivals'],
          prices: 'Moderate',
          notes: 'Singapore Food Festival happens in April; great variety of local and international cuisine.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Music festivals', 'Rooftop parties', 'Club events'],
          crowd: 'Mixed',
          notes: 'Active nightlife scene with mix of tourists and locals; many areas to explore.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Popular attractions like Gardens by the Bay have steady crowds.',
          wait: 'Moderate lines at major attractions; manageable with planning.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'Peak tourist season during June-August; book flights 2-3 months ahead.'
        },
        food: {
          specialties: ['Durian (in season)', 'Ice desserts', 'Seafood', 'Local specialties'],
          experiences: ['The Great Singapore Food Festival', 'Durian festivals', 'Night markets'],
          prices: 'Expensive',
          notes: 'Food events and festivals throughout summer; restaurant reservations recommended.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Singapore Night Festival', 'Music events', 'Cultural performances'],
          crowd: 'Tourist-heavy',
          notes: 'Lively atmosphere with major events and performances; many special nighttime activities.'
        },
        crowds: {
          level: 'High',
          attractions: 'Very crowded at all popular sites, especially during Great Singapore Sale.',
          wait: 'Long lines at major attractions; advance tickets highly recommended.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'September-November sees slightly more rain but good travel deals.'
        },
        food: {
          specialties: ['Mooncakes (mid-autumn)', 'Seafood', 'Local cuisine', 'Festival foods'],
          experiences: ['Mid-Autumn Festival foods', 'Hawker centers', 'Food tours'],
          prices: 'Moderate',
          notes: 'Mid-Autumn Festival brings special foods and events; pleasant dining experiences.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Formula 1 Night Race (September)', 'Halloween events', 'Cultural festivals'],
          crowd: 'Mixed',
          notes: 'F1 period is extremely busy with many parties and events; otherwise good balance of tourists and locals.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Steady crowds at main attractions; F1 period extremely busy.',
          wait: 'Reasonable wait times except during special events.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'High',
          prices: 'Expensive',
          availability: 'Limited',
          notes: 'December-February is peak season with holiday travel; book 3-4 months ahead.'
        },
        food: {
          specialties: ['Chinese New Year specialties', 'Holiday menus', 'Seafood', 'International cuisine'],
          experiences: ['Holiday dining', 'Special festive menus', 'New Year celebrations'],
          prices: 'Premium',
          notes: 'Christmas and Chinese New Year periods see special menus and festive offerings.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['Christmas light-up on Orchard Road', 'New Year countdown', 'Chinese New Year celebrations'],
          crowd: 'Tourist-heavy',
          notes: 'Festive atmosphere with extensive decorations and events; very busy holiday season.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Extremely crowded during Christmas, New Year, and Chinese New Year periods.',
          wait: 'Very long waits at popular attractions; advance booking essential.'
        }
      }
    },
    "Sydney": {
      "Spring": {
        season: "Spring",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'September-November offers pleasant weather and beautiful blooms; good flight availability.'
        },
        food: {
          specialties: ['Seafood', 'Spring lamb', 'Fresh produce', 'Outdoor grills'],
          experiences: ['Outdoor dining', 'Food festivals', 'Waterfront restaurants'],
          prices: 'Moderate',
          notes: 'Food festivals showcase spring produce; outdoor dining becomes popular.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Vivid Sydney (May/June)', 'Spring racing carnival', 'Outdoor concerts'],
          crowd: 'Mixed',
          notes: 'Weather becomes perfect for outdoor events; vibrant atmosphere.'
        },
        crowds: {
          level: 'Moderate',
          attractions: 'Popular sites like Opera House and beaches get busier as weather improves.',
          wait: 'Reasonable wait times at major attractions; good season for exploring.'
        }
      },
      "Summer": {
        season: "Summer",
        flights: {
          demand: 'Peak',
          prices: 'Premium',
          availability: 'Limited',
          notes: 'December-February is high season with hot weather; book flights 3-4 months ahead.'
        },
        food: {
          specialties: ['Seafood barbecues', 'Fresh tropical fruits', 'Beach picnics', 'Ice cream'],
          experiences: ['Beachside dining', 'Sydney Festival food events', 'Outdoor markets'],
          prices: 'Expensive',
          notes: 'Peak season brings vibrant food scene; outdoor dining very popular but busy.'
        },
        nightlife: {
          activity: 'Vibrant',
          events: ['New Year celebrations', 'Sydney Festival', 'Outdoor concerts'],
          crowd: 'Tourist-heavy',
          notes: 'Extremely active nightlife scene; New Year period is world-famous.'
        },
        crowds: {
          level: 'Peak',
          attractions: 'Very crowded everywhere, especially beaches, harbor areas, and major sites.',
          wait: 'Long waits at popular attractions; advance tickets essential during holiday period.'
        }
      },
      "Fall": {
        season: "Fall",
        flights: {
          demand: 'Moderate',
          prices: 'Moderate',
          availability: 'Good',
          notes: 'March-May offers pleasant temperatures and fewer tourists; good flight deals.'
        },
        food: {
          specialties: ['Autumn produce', 'Oysters', 'Mushroom dishes', 'Comfort food'],
          experiences: ['Food and wine festivals', 'Indoor dining', 'Cultural food events'],
          prices: 'Moderate',
          notes: 'Great time for food events with harvest season; comfortable dining temperatures.'
        },
        nightlife: {
          activity: 'Lively',
          events: ['Sydney Comedy Festival', 'Cultural events', 'Fall concerts'],
          crowd: 'Local',
          notes: 'More authentic local experience with fewer tourists; comfortable evening temperatures.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Less crowded at major attractions; pleasant time to explore the city.',
          wait: 'Minimal wait times at most attractions; better access to popular sites.'
        }
      },
      "Winter": {
        season: "Winter",
        flights: {
          demand: 'Low',
          prices: 'Budget-friendly',
          availability: 'Abundant',
          notes: 'June-August is low season (except for snow destinations); best flight deals.'
        },
        food: {
          specialties: ['Hearty soups', 'Truffle dishes', 'Winter menus', 'Hot drinks'],
          experiences: ['Winter food festivals', 'Cozy restaurants', 'Special winter menus'],
          prices: 'Budget-friendly',
          notes: 'Many winter specials and deals; easier to get tables at popular restaurants.'
        },
        nightlife: {
          activity: 'Moderate',
          events: ['Vivid Sydney light festival', 'Indoor concerts', 'Winter cultural events'],
          crowd: 'Local',
          notes: 'Vivid Sydney (May/June) brings vibrant nightlife; otherwise more low-key local scene.'
        },
        crowds: {
          level: 'Low',
          attractions: 'Least crowded time except during Vivid Sydney festival.',
          wait: 'Minimal wait times at major attractions; best time for crowd-free sightseeing.'
        }
      }
    }
  };

  // Check if we have specific data for this city and season
  if (cityData[city] && cityData[city][season]) {
    return cityData[city][season];
  }

  // For cities not in our database, return default data
  return defaultData;
};

export default function SeasonalExpectations({ city, startDate, endDate, className = "" }: SeasonalExpectationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [seasonalData, setSeasonalData] = useState<SeasonalFactor | null>(null);
  const [season, setSeason] = useState<string>("Unknown");

  useEffect(() => {
    if (city) {
      // Determine the season from the start date
      const seasonName = getSeasonFromDate(startDate);
      setSeason(seasonName);
      
      // Get seasonal data for this city and season
      const data = getSeasonalData(city, seasonName);
      setSeasonalData(data);
      setIsLoading(false);
    }
  }, [city, startDate]);

  // Format date range for display
  const formatDateRange = () => {
    if (!startDate || !endDate) return "Select dates";
    
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      if (!isValid(start) || !isValid(end)) return "Invalid dates";
      
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    } catch (error) {
      return "Invalid dates";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!seasonalData) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No seasonal data available for {city}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            What to Expect in {city}
          </h3>
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="mb-1">
              {season} Season
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDateRange()}</span>
          </div>
        </div>

        <Tabs defaultValue="flights" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="flights">
              <Plane className="w-4 h-4 mr-2" /> Flights
            </TabsTrigger>
            <TabsTrigger value="food">
              <UtensilsCrossed className="w-4 h-4 mr-2" /> Food
            </TabsTrigger>
            <TabsTrigger value="nightlife">
              <Music className="w-4 h-4 mr-2" /> Nightlife
            </TabsTrigger>
            <TabsTrigger value="crowds">
              <Users className="w-4 h-4 mr-2" /> Crowds
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="flights" className="space-y-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Demand</div>
                <div className="font-semibold">{seasonalData.flights.demand}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Pricing</div>
                <div className="font-semibold">{seasonalData.flights.prices}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Availability</div>
                <div className="font-semibold">{seasonalData.flights.availability}</div>
              </div>
            </div>
            <p className="text-sm">{seasonalData.flights.notes}</p>
          </TabsContent>
          
          <TabsContent value="food" className="space-y-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Seasonal Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalData.food.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Dining Experiences</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalData.food.experiences.map((exp, index) => (
                  <Badge key={index} variant="outline">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Price Level:</span>
              <span>{seasonalData.food.prices}</span>
            </div>
            
            <p className="text-sm">{seasonalData.food.notes}</p>
          </TabsContent>
          
          <TabsContent value="nightlife" className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Activity Level</div>
                <div className="font-semibold">{seasonalData.nightlife.activity}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Crowd Type</div>
                <div className="font-semibold">{seasonalData.nightlife.crowd}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Seasonal Events</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalData.nightlife.events.map((event, index) => (
                  <Badge key={index} variant="secondary">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
            
            <p className="text-sm">{seasonalData.nightlife.notes}</p>
          </TabsContent>
          
          <TabsContent value="crowds" className="space-y-4">
            <div className="p-4 bg-muted rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Crowd Level</span>
                <Badge 
                  variant={
                    seasonalData.crowds.level === 'Low' ? 'outline' :
                    seasonalData.crowds.level === 'Moderate' ? 'secondary' :
                    seasonalData.crowds.level === 'High' ? 'default' : 'destructive'
                  }
                >
                  {seasonalData.crowds.level}
                </Badge>
              </div>
              
              <div className="w-full bg-background rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full bg-primary`}
                  style={{ 
                    width: seasonalData.crowds.level === 'Low' ? '25%' :
                           seasonalData.crowds.level === 'Moderate' ? '50%' :
                           seasonalData.crowds.level === 'High' ? '75%' : '100%'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Umbrella className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Attractions</div>
                  <p className="text-xs text-muted-foreground">{seasonalData.crowds.attractions}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Thermometer className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Wait Times</div>
                  <p className="text-xs text-muted-foreground">{seasonalData.crowds.wait}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}