Vue.createApp({
    data() {
        return {
            key: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            secret: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            accessToken: '67effa0e-f71e-393b-9012-e5117f0de90b',
            stopData: [
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                },
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                },
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                }
            ],
            userInput: '',
            counter: 0,
            serverDateTime: null,
            currentTime: '00:00:00',
            buttonList: [],
            newButton: '',

        };
    },
    created() {
        this.updateTime();
        setInterval(this.updateTime, 1000);

        const savedStopData = localStorage.getItem('stopData');
        if (savedStopData) {
            this.stopData = JSON.parse(savedStopData);
        }

        const buttons = localStorage.getItem('buttons');
        if (buttons) {
            this.buttonList = JSON.parse(buttons);
        }

    },
    methods: {
        updateTime() {
            let timNow = new Date;
            this.currentTime =
            `${this.dubbledigits(timNow.getHours())}:
            ${this.dubbledigits(timNow.getMinutes())}:
            ${this.dubbledigits(timNow.getSeconds())}`;
        },
        dubbledigits(number) {
            return number < 10 ? '0' + number : number;
        },
        async getAccessToken() {
            const url = 'https://api.vasttrafik.se/token';
            const callInfo = {
                Authorization: `Basic ${btoa(`${this.key}:${this.secret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const body = new URLSearchParams({
                format: 'json',
                grant_type: 'client_credentials',
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: callInfo,
                body,
            });

            const data = await response.json();
            this.accessToken = data.access_token;

        },
        async getStopId() {
            const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name';
            const callInfo = {
                Authorization: `Bearer ${this.accessToken}`,
            };
            const dataForSearch = new URLSearchParams({
                format: 'json',
                input: this.userInput,
            });

            const response = await fetch(`${url}?${dataForSearch}`, {
                headers: callInfo,
            });

            this.stopData[this.counter].depatureName = this.userInput;

            const data = await response.json();
            this.stopData[this.counter].stopId = data.LocationList.StopLocation[0].id;


        },
        async getDepartures() {
            await this.getAccessToken();
            await this.getStopId();
            if (this.userInput.trim() === '') {
                return;
            }

            const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard';
            const callInfo = {
                Authorization: `Bearer ${this.accessToken}`,
            };
            const now = new Date();

            const dataForSearch = new URLSearchParams({
                format: 'json',
                id: this.stopData[this.counter].stopId,
                date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                time: `${now.getHours()}:${now.getMinutes()}`,
            });

            const response = await fetch(`${url}?${dataForSearch}`, {
                headers: callInfo,
            });

            const data = await response.json();
            const serverDateTime = new Date(
                `${data.DepartureBoard.serverdate} ${data.DepartureBoard.servertime}`
            );

            this.sortList(data, serverDateTime, now);

            if (this.counter === 3) {
                this.counter = 0;
            }

        },
        sortList(data, serverDateTime, now) {
            this.stopData[this.counter].departures = data.DepartureBoard.Departure
                .map((departure) => {
                    const { sname, direction, time, date, realTime, realDate } = departure;

                    const departureDateTime = realTime
                        ? new Date(`${realDate} ${realTime}`)
                        : new Date(`${date} ${time}`);

                    const diff = Math.round(
                        (departureDateTime.getTime() - serverDateTime.getTime()) / 1000 / 60
                    );
                    return { sname, direction, time, realTime, diff };
                })
                .filter((departure) => {
                    const departureDateTime = new Date(
                        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${departure.time}`
                    );
                    return departureDateTime.getTime() > now.getTime();
                })
                .sort((a, b) => a.diff - b.diff)
                .slice(0, 5);

            this.counter++;
            localStorage.setItem('stopData', JSON.stringify(this.stopData));
        },

        updateStop(stopName) {
            this.stopName = stopName;
            this.getDepartures();
        },
        resetAll() {
            this.counter = 0;
            this.stopData.forEach(stop => {
                stop.stopId = '';
                stop.depatureName = '';
                stop.departures = [];
            });
        },

        addButton() {
            this.buttonText = this.userInput;
            if (this.buttonText) {
                this.buttonList.push(this.buttonText);
                this.buttonText = '';
                localStorage.setItem('buttons', JSON.stringify(this.buttonList));
                this.newButton = '';
            }

        },
        deleteButton(index) {
            this.buttonList.splice(index, 1);
            localStorage.setItem('buttons', JSON.stringify(this.buttonList));
        },

        useFavorite(buttonText) {
            this.userInput = buttonText;
            this.getDepartures();

        },
    }
}).mount('#app');