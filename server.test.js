const serverModules = require("./server.js");

test('Username is taken', () => {
    const testUsername = 'Gigi';
    const usersList = [{
        "username": "Gigi",
        "password": "123"
    }];
    expect(serverModules.isUsernameTaken(testUsername, usersList)).toBe(true);
    expect(serverModules.isUsernameTaken("Waleed", usersList)).toBe(false);

});

test('First time logging in', () => {
    const testUsername = 'Gigi';
    const userProfiles = [
        {
            'username': 'Gigi',
            'profile': {
                "fullname": "test",
                "state": "CA"
            }
        },
    ];
    expect(serverModules.firstTimeLogin(testUsername, userProfiles)).toBe(false);
    expect(serverModules.firstTimeLogin("Waleed", userProfiles)).toBe(true);
});

test('Get User Profiles', () => {
    const testUsername = 'Gigi';
    const userProfiles = [
        {
            'username': 'Gigi',
            'profile': {
                "fullname": "test",
                "state": "CA"
            }
        },
    ];
    expect(serverModules.getUserProfile(testUsername, userProfiles)).toBe(userProfiles[0]);
    expect(serverModules.getUserProfile("Waleed", userProfiles)).toEqual(undefined);
});

test('Initial Profile Exists', () => {
    const testUsername = 'Gigi';
    const userProfiles = [
        {
            'username': 'Gigi',
            'profile': {
                "fullname": "test",
                "state": "CA"
            }
        },
    ];
    expect(serverModules.initialProfileExists(testUsername, userProfiles)).toBe(true);
    expect(serverModules.initialProfileExists("Waleed", userProfiles)).toBe(false);
});


test('Get User Quotes', () => {
    const testUsername = 'Gigi';
    const userQuotes = [
        {
            "username": "Gigi",
            "quotes": [{}, {}]
        },
        {
            "username": "Waleed",
            "quotes": []
        }
    ];
    expect(serverModules.getUserQuotes(testUsername, userQuotes)).toEqual({
        "username": "Gigi",
        "quotes": [{}, {}]
    });
    expect(serverModules.getUserQuotes("Waleed", userQuotes)).toEqual({
        "username": "Waleed",
        "quotes": []
    });
});

test('Contains Space', () => {
    const testSpace = 'Gigi Gigi';

    expect(serverModules.containsSpace(testSpace)).toBe(true);
    expect(serverModules.containsSpace("asdas")).toBe(false);
});

test('Exceeds Characters', () => {
    const testCharacters = 'Gigi Gigi';

    expect(serverModules.exceedsCharacters(testCharacters, 1000)).toBe(false);
    expect(serverModules.exceedsCharacters("21", 1)).toBe(true);
});