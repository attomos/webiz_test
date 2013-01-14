var dict = []

dict.push({
    key: "atom",
    value: "padlom"
});
for (var i = 0; i < dict.length; i++) {
    if (dict[i].key == "atom") {
        console.log("atom exists");
    } else {
        dict.push({
            key: "atom",
            value: "padlom"
        });
    }
}

console.log(dict.length);
console.log(dict);
