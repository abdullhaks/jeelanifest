Project plan for event managment app for jeelani fest 2026 contected by gousiya student cneter at shekh jeelani islamic academy.

Type: art fest management system for a islamic institution at kerala.
Sides/roles : admin panel and a public side

Stack and technologies : react js , tailwind css, lucide icons,framermotion, zustand , Antd ,  reusable components with materials ui, nest js , jwt , image upload and access with Cloudinary,socket io for real time updation (perform activities in public page based on admin activities), strict validations with Zod in frontend and backend , mongo db .


public route will be : localhost:5173
admin route will be : localhost:5173/admin


-file structure should be like 
-backend
   -nest app
-fronend
  -public
  -src
   -asset
   -components
      -admincomponents
      -publiccomponets
   -services
   -store
 -gitignore




Backend api = localhost:3000/api . call base api when the app loads it to make sure the backend is running. 

Dummy data : use dummy data , eg: images videos in development time , i will replace it with original one.

Responsiveness : must be responsive for mobile , tablet, and laptop . add PWA to the public page. 

Hosting will be : frontend in Vercel and backend in Render .   

-add search option with debounce,filter,sort and pagination by backend logic all over the platform.


Admin panel content;
Front end UI design should be inspired by : https://dribbble.com/shots/26973590-Employee-Management-Dashboard


-admin login (refresh and access tokens with proper validity and secrets considering production level config and compactable for os like windows android and ios in storing in cookie ) store admin data in zustand store and set public and private route based on admin data availability in store. 
-add proper confirmation for all admin activities to avoid falls actions. 
-option to change password and logout , 

-well detailed dashboard with live analytics.

-page to manage competitions . (crud) , name , type(group or individual.When the program is individual store 3 separate data for sub junior, junior and senior , in case if we want to disable any of them this way will be useful.), date,time,stage (default not fix , will add it after creation, by edit option) , stage options =(stage 1 ,stage 2 , off stage). option to manage program status (started,end,upcoming) ).


-group management page . (crud( soft delete)), (name , logo image (optional if not available take first letter), total points ,list members ,choose leaders (array of student’s Id. [0]=main ,[1] = assistant leader,[2] = assistant leader,..).

-page to manage students. (crud) , (name, class , group,category(sub junior,junior,senior),profile image,points(default 0), programs (program Ids, default=non), if he got 1st/2nd or 3rd in any program add it’s status while list his programs. eg: progrms = ARABIC SPEECH,ENGLISH POEM - 1ST⭐⭐⭐,ENGLISH ESSAY - 2ND ⭐⭐ ,)after save the date option to add programs - load programs base on student’s category and load group items.

-Result management page : load programs. when selecting one, load participants . option to add results (if individual load students , if group item load group. save the result with points , first ,second, third , sometimes there is a chance for more than one winner in the same position eg: two participants share 1st position..). Option to publish results , when publishing add points group points and if it is individual add it to student points too. When publishing a realtime result announcement modal in the public page and update point graph in the public page with confetti ).
Add an option to announce the final result (which group got first place and first championship , who got second and third , when publishing a real time special modal in a public page with disclosing the champions with confetti).

-posters management - (crud) to add new program posters to add in poster collage in the public page.

-fest gallery management - (crud) image, description




Pubic part contents;
-front end UI UX should be inspired by https://www.awwwards.com.
-hero section - carocel(for display motion video of program,main images) , english and arabic captions with best typographies(it means in hero secion there will be an english title and and arabic title at a time).(route:’/’)

-live group point racing graph.(route:’/’)
-live Artistic talent racing section (based on point a student get, over all , best in sub junior, best in junior, best in senior )(route:’/’)
-display ongoing programs (eg: english poem reciting - STAGE 1)(route:’/’)
-program posters creative gallery(route:’/’)
-program coordinators section (route:’/’) coordinators images and details will be hard coded. 
-about program section(route:’/’)
-event count analytics data like 3 teams, 120+ events,..(route:’/’) 

-group introducing section(route: ‘/’)

-result page. Load whole publish results. Add detail modal to display result details in detail.(route:’/results’,’result/id’)
-live result announcement modal , open when admin publish a result
-live final announcement modal , open when admin publish final result.
-fest gallery - to display fest related images (route:’festgallary’)

-group listing page whole group related data (route:‘/groups’).
-students listing page with all student related data (personal details, competitions, results, points and all….) (route : ‘participants’, ‘’participant/id)


-footer (in all page)


-Backend .env almost like ;
mongo_url=mongodb+srv://
port_number=3000


origins=[localhost:5173,localhost:5174,https://jsc-official.vercel.app]


CLOUDINARY_CLOUD_NAME=thc
CLOUDINARY_API_KEY=6285
CLOUDINARY_API_SECRET=5st89p
JWT_ACCESS_SECRET=change_me_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
SEED_ADMIN_USERNAME=jeelanifestadmin
SEED_ADMIN_PASSWORD=admin123
DEFAULT_PAGE_LIMIT=9




Frontend .env almost like ; 
VITE_API_URL=http://localhost:3000/api
