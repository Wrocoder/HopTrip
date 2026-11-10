// Synthetic contract fixture: a planning preview is not confirmed convenience.
export function planningQuality(recommendation={}){
 const weights={completeness:15,travel:20,usable_time:30,connections:15,airports:10,leave:10};
 return {version:'trip-quality-v1',status:'KNOWN',score:100,reasons:[],
  components:Object.entries(weights).map(([key,max_points])=>({key,points:max_points,max_points,known:true})),
  policy:{weights,good_travel_minutes:240,bad_travel_minutes:1440,target_usable_minutes:1680,
   inconvenient_stay_percent:50,night_home_travel_percent:50,connection_penalty_percent:20,
   long_connection_penalty_percent:40,night_connection_penalty_percent:25,risky_connection_penalty_percent:50,airport_change_penalty_percent:50},
  recommendation:{version:'trip-recommendation-v1',recommendation_eligible:false,planning_eligible:true,
   label:'REQUIRES_PLANNING',data_confidence:'LIMITED',warnings_severity:'WARNING',reasons:['TRANSFER_TIME_UNKNOWN'],...recommendation}};
}
