import oracledb from 'oracledb'; // In packages.json we have {"type": "module"}

// initialize oracle client library at start once
oracledb.initOracleClient({ libDir: '<location_for_oracle_client>\\Desktop\\instantclient_21_3' });

export default {
    getNewConnection: async function () {
        var conn = await oracledb.getConnection({
            user: "<username>",
            password: "<password>",
            connectString: "<Service_name>:<port>/<Service_name>"
        });
        return conn;
    },
    getDesignationList: async function () {
        var result = [];
        var connection = null;
        try {
            connection = await this.getNewConnection();
            console.log('connected to database');

            let sql = `SELECT DESIGNATION_ID, DESIGNATION FROM T_DESIGNATION ORDER BY DESIGNATION`;

            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                // fetchArraySize:   100                 // internal buffer allocation size for tuning
            };

            let rs = await connection.execute(sql, binds, options);


            //console.dir(rs.rows, { depth: null });        
            rs.rows.forEach(element => {
                let elm = {
                    ID: element.DESIGNATION_ID,
                    NAME: element.DESIGNATION
                };
                result.push(elm); //console.log(element);
            });
        } catch (err) {
            console.error(err.message);
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                } catch (err) {
                    console.error(err.message);
                }
                return result;
            }
        }
    },
    getMaxStaffID: async function () {
        var result = 0;
        var connection = null;
        try {
            connection = await this.getNewConnection();
            let sql = `SELECT MAX (STAFF_ID) + 1 AS MAX_STAFF FROM T_STAFF`;

            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                // fetchArraySize:   100                 // internal buffer allocation size for tuning
            };

            let rs = await connection.execute(sql, binds, options);

            rs.rows.forEach(element => {
                result = element.MAX_STAFF;
            });
        } catch (err) {
            console.error(err.message);
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                } catch (err) {
                }
                return result;
            }
        }
    },
    getStaffList: async function () {
        var result = [];
        var connection = null;
        try {
            connection = await this.getNewConnection();
            console.log('connected to database');

            let sql = `SELECT S.STAFF_ID, S.FIRST_NAME, S.LAST_NAME, S.DESIGNATION_ID, 
                    D.DESIGNATION, S.EMIRATES_ID, S.EID_EXPIRY, S.MODIFIED_BY AS FILE_NAME, S.CREATED_BY, S.CREATION_DATE
                        FROM T_STAFF S INNER JOIN T_DESIGNATION D ON  S.DESIGNATION_ID = D.DESIGNATION_ID        
                            ORDER By S.STAFF_ID DESC FETCH FIRST 5 ROWS ONLY `;

            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                // fetchArraySize:   100                 // internal buffer allocation size for tuning
            };

            let rs = await connection.execute(sql, binds, options);


            //console.dir(rs.rows, { depth: null });        
            rs.rows.forEach(element => {
                let elm = {
                    STAFF_ID: element.STAFF_ID,
                    FIRST_NAME: element.FIRST_NAME,
                    LAST_NAME: element.LAST_NAME,
                    DESIG_ID: element.DESIGNATION_ID,
                    DESIGNATION: element.DESIGNATION,
                    EMIRATES_ID: element.EMIRATES_ID,
                    EID_EXPIRY: this.formatDate(element.EID_EXPIRY),
                    FILE_NAME: element.FILE_NAME,
                    CREATED_BY: element.CREATED_BY,
                    CREATION_DATE: this.formatDate(element.CREATION_DATE)
                };
                result.push(elm); //console.log(element);
            });
        } catch (err) {
            console.error(err.message);
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                    console.log('close connection success');
                } catch (err) {
                    console.error(err.message);
                }
                console.log('returning value');
                return result;
            }
        }
    },
    getStaffDetail: async function (param) {
        var result = [];
        var connection = null;
        try {
            connection = await this.getNewConnection();
            let sql = `SELECT STAFF_ID, COMPANY_ID, FIRST_NAME, LAST_NAME, DESIGNATION_ID, CREATED_BY, MODIFIED_BY, EMIRATES_ID, EID_EXPIRY FROM T_STAFF WHERE STAFF_ID=${param}`;

            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                // fetchArraySize:   100                 // internal buffer allocation size for tuning
            };

            let rs = await connection.execute(sql, binds, options);

            rs.rows.forEach(element => {
                result.push(element); //console.log(element);
            });
        } catch (err) {
            console.error(err.message);
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                } catch (err) {
                }
                return result;
            }
        }
    },
    addNewStaff: async function (param) {
        var result = 0;
        var connection = null;
        try {
            connection = await this.getNewConnection();
            let sql = `INSERT INTO T_STAFF (STAFF_ID, COMPANY_ID, FIRST_NAME, LAST_NAME, DESIGNATION_ID, CREATED_BY, MODIFIED_BY, EMIRATES_ID, EID_EXPIRY) 
                        VALUES(${param.StaffId}, 113,'${param.FirstName}','${param.LastName}',${param.DesignationId},'topmost','${param.FileName}','${param.EmiratesId}','${param.EIDExpiry}')`;
            console.log(sql);
            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                autoCommit: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                // fetchArraySize:   100                 // internal buffer allocation size for tuning
            };

            let rs = await connection.execute(sql, binds, options);
            result = rs.rowsAffected;
        } catch (err) {
            result = -1;
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                } catch (err) {
                    result = -1;
                }
                return result;
            }
        }
    },
    updateStaff: async function (param) {
        var result = 0;
        var connection = null;
        try {
            connection = await this.getNewConnection();
            let sql = `UPDATE T_STAFF SET FIRST_NAME='${param.FirstName}',
                        LAST_NAME='${param.LastName}', DESIGNATION_ID=${param.DesignationId}, 
                        MODIFIED_BY='${param.FileName}', EMIRATES_ID='${param.EmiratesId}',
                        EID_EXPIRY='${param.EIDExpiry}' WHERE STAFF_ID=${param.StaffId}`;
            console.log(sql);
            let binds = {};

            // For a complete list of options see the documentation.
            let options = {
                autoCommit: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
            };

            let rs = await connection.execute(sql, binds, options);
            result = rs.rowsAffected;
        } catch (err) {
            result = -1;
        } finally {
            if (connection) {
                try {
                    // Always close connections
                    await connection.close();
                } catch (err) {
                    result = -1;
                }
                return result;
            }
        }
    },
    formatDate: function (date) {
        var mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        var d = new Date(date),
            month = '' + mn[(d.getMonth())],
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('-');
    }
};

