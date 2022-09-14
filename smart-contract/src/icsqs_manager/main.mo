import Principal "mo:base/Principal";
import List "mo:base/List";
import Error "mo:base/Error";


shared (install) actor class ICSQS_MANAGER(adminPrincipals: List.List<Principal>) = 
this {

    public shared(caller) func sendMessage(message: Text) : async () {

        if(Principal.isAnonymous(caller.caller)) {
            throw Error.reject("Unauthorized");
        }
    }
}
