Author: Peizhou Zhang   (SN: 101110707)

How to run this app:
1. Installation:
    run mongod module in background
    npm install
2. Initialization:
    mkdir a4
    mongod --dbpath = a4
    node database-initializer.js
3. Run:
    node server.js
    http://localhost:3000

Some details:
1. For "Search User": the server will return all user whose username start with the input string. For example, if the input string is "w",
   the server will return all user whose username start with "w".
2. If user is not log in, and the search results are all private profile, the server will tell user that only loged in user can see private
   profile. If the search result is null, the server will tell user that there is no match. These two situations are different.
3. The username is not case-sensitive, which means that "ToNy" is equal to "tony". However, the password is case-sensitive.
4. Neither username nor password allow space.