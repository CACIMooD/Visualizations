export const config = {
  data: {
    rows: [
      {
        columns: [
          { title: 'ID', content: '1', format: 'rownum', editable: false, headerFilter: false, columnSorter: false, width: 40, frozen: true, resizable: false },
          { title: 'name', content: 'Bristol', format: null, editable: true, headerFilter: true, columnSorter: true, width: null, frozen: false, resizable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DB', format: null, editable: true, headerFilter: false, columnSorter: true, width: null, frozen: false, resizable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '4', format: 'star', editable: true, headerFilter: false, columnSorter: true, width: null, frozen: false, resizable: true },
                  { title: 'date', content: '2024-07-22T12:07:32Z', format: '%dd-%MM-%yyyy', editable: true, headerFilter: false, columnSorter: true, width: null, frozen: false, resizable: true },
                  { title: 'date2', content: '2024-07-22T12:07:32Z', format: null, editable: true, headerFilter: false, columnSorter: true, width: null, frozen: false, resizable: true },
                  { title: 'date3', content: '2024-07-22T12:07:32Z', format: 'datetime', editable: true, headerFilter: false, columnSorter: true, width: null, frozen: false, resizable: true }
                ]
              }
            ]
          }],
        groupBy: 'Domestic',
        groupRows: true
      },
      {
        columns: [
          { title: 'name', content: 'Manchester United', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DB', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '0', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'Domestic'
      },
      {
        columns: [
          { title: 'name', content: 'Spain', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DB', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '1', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'International'
      },
      {
        columns: [
          { title: 'name', content: 'England', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DB', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '2', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'International'
      },
      {
        columns: [
          { title: 'name', content: 'Manchester City', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DB', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '5', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'Domestic'
      },
      {
        columns: [
          { title: 'name', content: 'Germany', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DI', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '4', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'International'
      },
      {
        columns: [
          { title: 'name', content: 'France', format: null, editable: true }
        ],
        groups: [
          {
            title: 'New Group 1',
            columns: [
              { title: 'acronym', content: 'DI', format: null, editable: true }
            ],
            subGroups: [
              {
                title: 'New Group 2',
                columns: [
                  { title: 'rating', content: '3', format: 'star', editable: true }
                ]
              }
            ]
          }],
        groupBy: 'International'
      }
    ],
    editable: true,
    navigable: false,
    columnSorting: true,
    headerFiltering: true,
    showDetailedTitles: true
  }
}
