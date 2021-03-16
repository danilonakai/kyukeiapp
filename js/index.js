var reports = check_localstorage('reports');
var kyukei_time = check_localstorage('kyukei_time');
var id = check_localstorage('id');
var today = check_localstorage('today');
var kyukei_timer;
var finished = false;
var selected_date = get_date('current','day','selected_date');

function kyukei(){
	let seconds = $('.timer-seconds').html();
	let minutes = $('.timer-minutes').html();
	let hours = $('.timer-hours').html();

	if(parseInt(seconds) < 1){
        if(parseInt(minutes) == 0){
            if(parseInt(hours) == 0){
                finished = true;
            }else{
                seconds = 59;
                minutes = 59;
                hours = parseInt(hours) - 1;
                kyukei_time[0] = functionality('convert_format',hours);
                kyukei_time[1] = functionality('convert_format',minutes);
                kyukei_time[2] = functionality('convert_format',seconds);
            }
        }else{
            seconds = 59;
            minutes = parseInt(minutes) - 1;
            kyukei_time[1] = functionality('convert_format',minutes);
            kyukei_time[2] = functionality('convert_format',seconds);
        }
	}else{
		seconds = parseInt(seconds) - 1;
        kyukei_time[2] = functionality('convert_format',seconds);
	}
    update_view();
}

function kyukei_actions(val){
    switch(val){
        case 'Start':
            $('#kyukei-btn').html('Stop');
            $('#kyukei-btn').removeClass().addClass('stop-btn');
            functionality('play_sound','start');
            kyukei_timer = setInterval(kyukei,1000); 
            add_report("start");
            update_view();
            break;

        case 'Stop':
            $('#kyukei-btn').html('Start');
            $('#kyukei-btn').removeClass().addClass('start-btn');
            functionality('play_sound','stop');
            clearInterval(kyukei_timer);
            add_report("stop");
            update_view();
            break;
    }
}

function update_view(){
    if(check_report('prev') == true){
        $('.date-prev').css({'visibility':'visible'});
    }else{
        $('.date-prev').css({'visibility':'hidden'});
    }
    
    if(selected_date.toLocaleDateString() == get_date('current','day','selected_date').toLocaleDateString()){
        $('.date-next').css({'visibility':'hidden'});

        // TITLE
        $('#today h2').html(get_date('current','day','title'));

        // UPDATE TIMER
        $('.timer-hours').html(kyukei_time[0]);
        $('.timer-minutes').html(kyukei_time[1]);
        $('.timer-seconds').html(kyukei_time[2]);
        $('#kyukei-btn').removeAttr('disabled');

        // REPORT LIST
        let report_list = "";
        $.each($(reports)[get_date('current','month')].days, function(){
            if($(this)[0].day == get_date('current','day')){
                $.each($(this)[0].history, function(){
                    if($(this)[0].duration != null && $(this)[0].duration >= 1000){
                        let start_time = new Date($(this)[0].start_time).toLocaleTimeString();
                        let finish_time = new Date($(this)[0].finish_time).toLocaleTimeString();
                        let duration = parseInt($(this)[0].duration / 1000);
                    
                        let add_report = '<tr><td>'+start_time+'</td><td>'+finish_time+'</td><td>'+functionality('convert_time',duration)+'</td></tr>';
                        report_list = report_list + add_report;
                    }
                });
            }
        });  
        $('.report table tbody').html(report_list);

        // CHECK IF IS FINISHED
        if(finished == true){
            finished = false;
            clearInterval(kyukei_timer);
            kyukei_time = ['00','00','00'];
            kyukei_actions('Stop');
            setTimeout(play_sound('finish'),2000);
        }

        // SET LOCALSTORAGE_
        if(localStorage.getItem('today') != get_date('current','day')){
            localStorage.setItem('kyukei_time',['01','30','00']);
        }else{
            localStorage.setItem('kyukei_time',JSON.stringify(kyukei_time));
        }
        localStorage.setItem('today',get_date('current','day'));
        localStorage.setItem('id',id);
        localStorage.setItem('reports',JSON.stringify(reports));  

    }else{
        $('.date-next').css({'visibility':'visible'});

        // TITLE
        $('#today h2').html(get_date(selected_date,'day','title'));

        // UPDATE TIMER
        $('.timer-hours').html('00');
        $('.timer-minutes').html('00');
        $('.timer-seconds').html('00');
        $('#kyukei-btn').attr('disabled','disabled');

        // // REPORT LIST
        let report_list = "";
        $.each($(reports)[get_date(selected_date,'month')].days, function(){
            if($(this)[0].day == get_date(selected_date,'day')){
                $.each($(this)[0].history, function(){
                    if($(this)[0].duration != null && $(this)[0].duration >= 1000){
                        let start_time = new Date($(this)[0].start_time).toLocaleTimeString();
                        let finish_time = new Date($(this)[0].finish_time).toLocaleTimeString();
                        let duration = parseInt($(this)[0].duration / 1000);
                    
                        let add_report = '<tr><td>'+start_time+'</td><td>'+finish_time+'</td><td>'+functionality('convert_time',duration)+'</td></tr>';
                        report_list = report_list + add_report;
                    }
                });
            }
        });  
        $('.report table tbody').html(report_list);
    }
}

function check_localstorage(val){
    switch(val){
        case 'reports':
            if(localStorage.getItem('reports') != null){
                return JSON.parse(localStorage.getItem('reports'));
            }else{
                return functionality('get_structure');
            }
        break;

        case 'kyukei_time':
            if(localStorage.getItem('reports') != null){
                return JSON.parse(localStorage.getItem('kyukei_time'));
            }else{
                return ['01','30','00'];
            }
        break;

        case 'today':
            if(localStorage.getItem('today') != null){
                return localStorage.getItem('today');
            }else{
                return get_date('current','day');
            }
        break;

        case 'id':
            if(localStorage.getItem('id') != null){
                return parseInt(localStorage.getItem('id'));
            }else{
                return get_date('current','day','id');
            }
        break;
    }
}

function get_date(date_val,val,format){
    let date;

    if(date_val == 'current'){
        date = new Date();
    }else{
        date = date_val;
    }

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let local = months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear();
    
    switch(val){
        case 'day':
            switch(format){
                default:
                    return date.getDate();
                break;

                case 'title':
                    return local;
                break;

                case 'id':
                    return parseInt(String(date.getFullYear())+String(date.getMonth() + 1)+String(date.getDate()) + "01");
                break;

                case 'selected_date':
                    return date;
                break;
            }
        break;

        case 'month':
            switch(format){
                default:
                    return date.getMonth();
                break;
            }
        break;
    }
}

function add_report(val){
    let time = new Date().getTime();

    switch(val){
        case "start":
            $.each($(reports)[get_date('current','month')].days, function(){
                if($(this)[0].day == get_date('current','day')){
                    $(this)[0].history.push({'id':id,'start_time': time,'finish_time':null,'duration':null});    
                }
            });

            break;

        case "stop":
            $.each($(reports)[get_date('current','month')].days, function(){
                if($(this)[0].day == get_date('current','day')){
                    let start_time = $(this)[0].history[($(this)[0].history.length - 1)].start_time

                    $(this)[0].history[($(this)[0].history.length - 1)].finish_time = time;
                    $(this)[0].history[($(this)[0].history.length - 1)].duration = new Date(time) - new Date(start_time);
                }
            });
            id = id + 1;
            break;
    }
}

function functionality(name,val){
    switch(name){
        case 'play_sound':
            let btn_start_sound = new Audio('sounds/button-start.mp3');
            let btn_stop_sound = new Audio('sounds/button-stop.mp3');
            let finish_sound = new Audio('sounds/finish.mp3');

            switch(val){
                case 'start':
                    btn_start_sound.play();
                    break;
        
                case 'stop':
                    btn_stop_sound.play();
                    break;
        
                case 'finish':
                    finish_sound.play();
                    break;
            }
        break;
        
        case 'convert_format':
            if(String(val).length == 1){
                val = "0" + String(val);
                return val;
            }else{
                return String(val);
            }
        break;

        case 'get_structure':
            let structure = [];
            $.getJSON('reports_structure.json').done(function(data){
                $(data).each(function(){
                    structure.push($(this)[0]);
                });
            });
            return structure;
        break;

        case 'create_day':
            let today_exist;

            if($(reports)[get_date('current','month')].days.length > 0){
                $.each($(reports)[get_date('current','month')].days, function(){
                    if($(this)[0].day == get_date('current','day')){
                        today_exist = true;
                        return;
                    }else{
                        today_exist = false;
                    }
                });
            }else{
                today_exist = false;
            }

            if(today_exist == false){
                $(reports)[get_date('current','month')].days.push({'day':get_date('current','day'),'history':[]});
            }
        break;

        case 'convert_time':
            let minutes;
            let hours;

            if(val >= 3600){
                hours = parseInt(val / 3600);
                minutes = parseInt((val - (hours * 3600)) / 60);
                seconds = val - (hours * 3600) - (minutes * 60);
                result = hours+"h "+minutes+"m "+seconds+"s"
                return result;
            }else{
                if(val >= 60){
                    minutes = parseInt(val / 60);
                    seconds = val - (minutes * 60);
                    result = minutes+"m "+seconds+"s"
                    return result;
                }else{
                    result = val+"s";
                    return result;
                }
            }
        break;    

        case 'select_date':
            if(val == 'prev'){
                if(check_report('prev') == true){
                    selected_date.setDate(selected_date.getDate() - 1);
                }
            }else if(val == 'next'){
                // if(check_report('next') == true){
                    selected_date.setDate(selected_date.getDate() + 1);
                // }
            }
        
            update_view();
        break;
    }
}

function check_report(val){
    let check = new Date(selected_date);
    let status;

    if(val == 'prev'){
        check.setDate(check.getDate() - 1);        
    }else if(val == 'next'){
        check.setDate(check.getDate() + 1); 
    }

    $.each($(reports)[get_date(check,'month')].days, function(){
        if($(this)[0].day == get_date(check,'day')){
            if($(this)[0].history.length > 0){
                status = true;
            }else{
                status = false;
            }
        }
    }); 
    return status;
}

$(window).on('load',function(){
    functionality('create_day');
    
    update_view();

    $('#kyukei-btn').click(function(){
        if($('#kyukei-btn').html() == 'Start'){
            kyukei_actions('Start');
        }else if($('#kyukei-btn').html() == 'Stop'){
            kyukei_actions('Stop');
        }
    });

    $('.date-prev').click(function(){
        functionality('select_date','prev');
    });

    $('.date-next').click(function(){
        functionality('select_date','next');
    });
});