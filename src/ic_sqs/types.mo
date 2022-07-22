// type definations
module {
  public type canister_id = Principal;
  public type ErrorCustom = {
        #NotFound;
        #Unauthorized;
        #BadRequest;
  };
};