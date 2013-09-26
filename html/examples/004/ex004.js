// == create static dm list ==========================================
FM.DmList.addConfiguration('staticListExample', {
    responseObject: FM.DmObject,
    data: [ // for all query params
        {id:1, name: "name1",description: "description 1"},
        {id:2, name: "name2",description: "description 2"},
        {id:3, name: "name3",description: "description 3"},
        {id:4, name: "name4",description: "description 4"}
    ]
});
