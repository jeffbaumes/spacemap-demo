/*jslint unparam: true, nomen: true */
/*globals $, console, d3, tangelo */

$(function () {
    'use strict';

/*
    var datasets = [
        {
            'file': 'graph_export_2.json',
            'transform': function (data) {
                data.nodes.forEach(function (d) {
                    d.lat = +d.lat;
                    d.lon = +d.lon;
                    d.random = Math.random();
                    d.category = Math.round(Math.random() * 10);
                    d.time = new Date();
                    if (d.title.indexOf('>') >= 0) {
                        d.shortTitle = d.title.split('>')[1].split('-')[0];
                    } else {
                        d.shortTitle = d.title.split(':')[1];
                    }
                return data.nodes;
            }
        }
        ,
        {
            'file': 'software.json'
        }
    ];
*/
    var constraints = [],
        spacemap,
        dataStack = [],
        data,
        nihDemo = false,
        types = [
            'link',
            'link-closest',
            'link-bin',
            'x',
            'y',
            'ordinalx',
            'ordinaly',
            'xy',
            'map',
            'binx',
            'biny',
            'linex',
            'liney',
            'radius'
        ],
        fields = [],
        fieldMap = {};

    $('#control-panel').controlPanel();
    d3.select('#control-panel').style('opacity', 0.9);

    function updateData(d) {
        fieldMap = {};
        fields = [];
        data = d;

        // data = data.nodes;
        // data.forEach(function (d) {
        //     d.lat = +d.lat;
        //     d.lon = +d.lon;
        //     d.random = Math.random();
        //     d.category = Math.round(Math.random() * 10);
        //     d.time = new Date();
        //     if (d.title.indexOf('>') >= 0) {
        //         d.shortTitle = d.title.split('>')[1].split('-')[0];
        //     } else {
        //         d.shortTitle = d.title.split(':')[1];
        //     }
        // });

        // Discover fields
        data.forEach(function (d) {
            var field, field2;
            for (field in d) {
                if (d.hasOwnProperty(field) && !fieldMap[field]) {
                    if (tangelo.isObject(d[field])) {
                        for (field2 in d[field]) {
                            if (d[field].hasOwnProperty(field2) && !fieldMap[field + '.' + field2]) {
                                fieldMap[field + '.' + field2] = true;
                                fields.push(field + '.' + field2);
                            }
                        }
                    } else {
                        fieldMap[field] = true;
                        fields.push(field);
                    }
                }
            }
        });
        fields.sort(function (a, b) { return d3.ascending(a, b); });

        spacemap = $('#vis').spaceMap({
            data: data,
            constraints: constraints,
            size: nihDemo ? function (d) {
                var val = d['AZ SGRQ_scoreTotal'];
                // 65, diagnosed at 60
                if (d['*A sid'] === '10455V') {
                    return 15;
                }
                return 6;
            } : function (d) { return 6; },
            color: nihDemo ? function (d) {
                var val = d['AZ SGRQ_scoreTotal'];
                // 65, diagnosed at 60
                if (d['*A sid'] === '10455V') {
                    return 'black';
                } else if (val > 40) {
                    return 'red';
                } else if (val > 20) {
                    return 'yellow';
                }
                return 'green';
            } : function (d) { return '#999'; },
            click: function (d) {
                console.log(d);
                $('#details').removeClass('hidden');
                d3.select('#image-x').attr('src', 'images/' + d['*A sid'] + '_INSP_STD_' + d['*B ccenter'] + '_COPD_projectionAlongX.png');
                d3.select('#image-y').attr('src', 'images/' + d['*A sid'] + '_INSP_STD_' + d['*B ccenter'] + '_COPD_projectionAlongY.png');
                d3.select('#image-z').attr('src', 'images/' + d['*A sid'] + '_INSP_STD_' + d['*B ccenter'] + '_COPD_projectionAlongZ.png');
                d3.select('#detail-id').text(d['*A sid']);
                d3.select('#detail-age').text(d['*E Age_Enroll']);
                d3.select('#detail-copdage').text(d['AT CopdAge']);
                d3.select('#detail-gender').text(d['*C gender'] === 1 ? 'Male' : 'Female');
                d3.select('#detail-bmi').text(d['*L BMI']);
                d3.select('#detail-packyears').text(d['*O ATS_PackYears']);
                d3.select('#detail-distwalked').text(d['*M distwalked']);
                d3.select('#detail-fev1').text(d['*U FEV1_FVC_utah']);
                d3.select('#detail-bode').text(d['*N BODE']);
                d3.select('#detail-gold').text(d['*R finalGold']);
                d3.select('#detail-sgrq').text(d['AZ SGRQ_scoreTotal']);
            }
        }).data('spaceMap');

        d3.select('#field-select').selectAll('option')
            .data(fields)
            .enter().append('option')
            .attr('value', function (d) { return d; })
            .text(function (d) { return d; });

    }

    $('#distance-slider').slider({
        min: 0,
        max: 100,
        value: 0,
        step: 1,
        change: function (evt, ui) {
            spacemap.option('linkDistance', ui.value);
        },
        slide: function (evt, ui) {
            spacemap.option('linkDistance', ui.value);
        }
    });

    $('#charge-slider').slider({
        min: 0,
        max: 1000,
        value: 200,
        step: 1,
        change: function (evt, ui) {
            spacemap.option('charge', -ui.value);
        },
        slide: function (evt, ui) {
            spacemap.option('charge', -ui.value);
        }
    });

    $('#gravity-slider').slider({
        min: 0,
        max: 0.2,
        value: 0.1,
        step: 0.001,
        change: function (evt, ui) {
            spacemap.option('gravity', ui.value);
        },
        slide: function (evt, ui) {
            spacemap.option('gravity', ui.value);
        }
    });

    if (nihDemo) {
        $('#bmi-slider').slider({
            min: 15,
            max: 45,
            value: 30,
            step: 1,
            change: function (evt, ui) {
                data[148]['*L BMI'] = ui.value;
                updateData(data.slice(0, +$('#limit').val()));
            },
            slide: function (evt, ui) {
                data[148]['*L BMI'] = ui.value;
                updateData(data.slice(0, +$('#limit').val()));
            }
        });

        $('#distwalked-slider').slider({
            min: 1000,
            max: 3000,
            value: 2000,
            step: 10,
            change: function (evt, ui) {
                data[148]['*M distwalked'] = ui.value;
                updateData(data.slice(0, +$('#limit').val()));
            },
            slide: function (evt, ui) {
                data[148]['*M distwalked'] = ui.value;
                updateData(data.slice(0, +$('#limit').val()));
            }
        });
    }

    $('#add-button').click(function () {
        var field = $('#field-select').val(),
            row = $('<div class="form-group"></div>'),
            spacerCol = $('<div class="col-sm-1"></div>'),
            fieldCol = $('<div class="col-sm-4"></div>'),
            fieldSelect = $('<select class="form-control"></select>'),
            sliderCol = $('<div class="col-sm-2"></div>'),
            slider = $('<div></div>'),
            typeCol = $('<div class="col-sm-2"></div>'),
            type = $('<select class="form-control"></select>'),
            delCol = $('<div class="col-sm-2"></div>'),
            del = $('<button class="btn btn-default"><i class="glyphicon glyphicon-trash"></i> Remove</button>'),
            constraint = {
                name: field,
                accessor: tangelo.accessor({field: field}),
                type: 'link',
                strength: 1.0
            };

        d3.select(type.get(0)).selectAll('option')
            .data(types)
            .enter().append('option')
            .attr('value', function (d) { return d; })
            .text(function (d) { return d; });
        type.on('change', function () {
            constraint.type = type.val();
            spacemap.option('constraints', constraints);
        });

        del.click(function () {
            var index = constraints.indexOf(constraint);
            row.remove();
            if (index >= 0) {
                constraints.splice(index, 1);
                spacemap.option('constraints', constraints);
            }
        });

        d3.select(fieldSelect.get(0)).selectAll('option')
            .data(fields)
            .enter().append('option')
            .attr('value', function (d) { return d; })
            .text(function (d) { return d; });
        fieldSelect.val(field);
        fieldSelect.on('change', function () {
            constraint.accessor = tangelo.accessor({field: fieldSelect.val()});
            spacemap.option('constraints', constraints);
        });

        constraints.push(constraint);
        fieldCol.append(fieldSelect);
        sliderCol.append(slider);
        typeCol.append(type);
        delCol.append(del);
        row.append(spacerCol);
        row.append(fieldCol);
        row.append(sliderCol);
        row.append(typeCol);
        row.append(delCol);
        $('#constraints').append(row);
        slider.slider({
            min: 0,
            max: 1,
            value: 1.0,
            step: 0.01,
            change: function (evt, ui) {
                constraint.strength = ui.value;
                spacemap.option('constraints', constraints);
            },
            slide: function (evt, ui) {
                constraint.strength = ui.value;
                spacemap.option('constraints', constraints);
            }
        });
        spacemap.option('constraints', constraints);
    });

    // $('#add-data-button').click(function () {
    //     var like = data.map(function(d) { return d._id.$oid; }).join(','),
    //         fields = constraints.map(function(d) { return d.name + ':' + d.strength; }).join(',');
    //
    //     d3.json('healthmap?like=' + like + '&limit=50&fields=' + fields, function (newData) {
    //         // Add new data to the data array
    //         var idMap = {};
    //         if (newData.length === 0) {
    //             return;
    //         }
    //         newData.forEach(function (d) {
    //             idMap[d._id.$oid] = true;
    //         });
    //         data.forEach(function (d) {
    //             if (!idMap[d._id.$oid]) {
    //                 newData.push(d);
    //             }
    //         });
    //         dataStack.push(data);
    //         updateData(newData);
    //     });
    // });

    $('#show-points-button').click(function () {
        spacemap.option('showPoints', !$(this).hasClass('active'));
    });

    $('#show-constraints-button').click(function () {
        spacemap.option('showConstraints', !$(this).hasClass('active'));
    });

    $('#show-links-button').click(function () {
        spacemap.option('showLinks', !$(this).hasClass('active'));
    });

    $('#set-limit-button').click(function () {
        d3.json('data.json', function (d) {
            data = d;
            if (nihDemo) {
                d3.select('#sgrq').text(data[46]['AZ SGRQ_scoreTotal']);
                $('#bmi-slider').slider('value', +data[46]['*L BMI']);
                $('#quit-slider').slider('value', +data[46]['*Q YearsSinceQuit']);
            };
            updateData(data.slice(0, +$('#limit').val()));
        });
    }).click();

    // $('#undo-button').click(function () {
    //     if (dataStack.length > 0) {
    //         updateData(dataStack.pop());
    //     }
    // });

    // d3.json('NCMS-first1000DataSet-ordered.json', function (data) {
    //     updateData(data.slice(0, 100));
    // });

});
