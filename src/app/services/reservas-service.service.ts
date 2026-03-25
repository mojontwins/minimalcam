import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from './config.service';
import { map, mapTo } from 'rxjs/operators'

// Interface prototypes for the REST API

export interface Link {
  href: string,
  title: string
};

export interface User {
  userId: string,
  username: string, 
  firstName: string,
  lastName: string,
  emailAddress: string, 
  links: Link [], 
  message: string
};

export interface UserForSelection {
  caption: string,
  userId: string,
  username: string
}

export interface UserDetailed {
  id: string,
  username: string,
  firstName: string, 
  lastName: string, 
  emailAddress: string,
  phoneNumber: string,
  dateCreated: string,
  lastLogin: string,
  statusId: string,
  timezone: string,
  organization: string,
  position: string,
  language: string,
  customAttributes: Object [],           // Won't use / don't know / N/A
  links: Link [],
  message: string
}

export interface UserPermission {
  id: number,
  name: string,
  links: Link [], 
  message: string
};

export interface UserDetailedSingle {
  id: string,
  username: string,
  firstName: string,
  lastName: string,
  emailAddress: string, 
  phoneNumber: string,
  lastLogin: string,
  statusId: string,
  timezone: string,
  organization: string,
  position: string, 
  language: string,
  icsUrl: string,
  customAttributes: Object [],           // Won't use / don't know, N/A
  permissions: UserPermission [],
  groups: Object [],                     // Won't use / don't know, N/A
  links: Link [],
  message: string
}

interface UserDetailedResponse {
  users: UserDetailed [],
  links: Link [],
  message: string
}

export interface RecurrenceRule {
  type: string,
  interval: number,
  monthlyType: string,
  weekdays: number [],
  repeatTerminationDate: string
};

export interface Resource {
  id: string,
  name: string,
  links: Link [],
  message: string
};

export interface ResourceDetails {
  resourceId: number,
  name: string,
  location: string,
  contact: string,
  notes: string,
  minLength: string,
  maxLength: string,
  requiresApproval: string,
  allowMultiday: string,
  maxParticipants: string,
  minNotice: string,
  maxNotice: string,
  description: string,
  scheduleId: string,
  icsUrl: string,
  statusId: string,
  statusReasonId: string,
  canHideInfo: number,
  customAttributes: Object [],           // Won't use / don't know, N/A
  links: Link [],
  message: string,
  bufferTime: string,
  resourceTypeId: number
};

export interface ResourceType {
  id: number,
  description: string,
  name: string
};

export interface ResourceTypesResponse {
  types: ResourceType [],
  links: Link [],
  message: string
};

export interface SecurityHashResponse {
  hash: string,
  links: Link [],
  message: string
}

export interface CheckSecurityResponse {
  result: string,
  links: Link [],
  message: string
};

export interface ResourceDetailsResponse {
  resources: ResourceDetails [],
  links: Link [],
  message: string
};

export interface LoginResult {
  sessionToken: string,
  sessionExpires: string,
  userId: string,
  isAuthenticated: boolean,
  links: Link [],
  message: string
};

// REST from Booked Scheduler uses slightly different
// objects for reservations in lists and standalone reservations
// because dragons.

export interface ReservationListItem {
  referenceNumber: string,
  startDate: string,
  endDate: string,
  firstName: string,
  lastName: string,
  resourceName: string,
  title: string,
  description: string,
  requiresApproval: boolean,
  isRecurring: boolean,
  scheduleId: string,
  userId: string,
  resourceId: number,
  duration: string,
  bufferTime: string,
  bufferedStartDate: string,
  bufferedEndDate: string,
  statusId: string,
  participants: string [],
  invitees: string [],
  links: Link [],
  message: string,
};

export interface Reservation {
  referenceNumber: string,
  startDateTime: string,
  endDateTime: string,
  title: string,
  description: string,
  requiresApproval: boolean,
  isRecurring: boolean,
  scheduleId: string,
  resourceId: string,
  owner: User,
  participants: User [],
  invitees: User [],                     // Won't use / don't know / N/A
  customAttributes: Object [],           // Won't use / don't know / N/A
  recurrenceRule: RecurrenceRule | null,
  attachments: Object [],                // Won't use / don't know / N/A
  resources: Resource [],
  accessories: Object [],                // Won't use / don't know / N/A
  startReminder: string,
  endReminder: string, 
  allowParticipation: string,
  links: Link [],
  message: string,
  onlyDate: string,
  hideOwner: number,
  hideDetails: number,
  conference_browser_link: string,
  conference_desktop_app_link: string,
  conference_id: string,
  conference_pin: string,
  conference_number_de: string,
  conference_number_es: string,
  conference_number_us: string
};

export interface PostReservationRequest {
  accessories: Object [],                // Won't use / don't know / N/A
  customAttributes: Object [],           // Won't use / don't know / N/A
  description: string,
  title: string,
  endDateTime: string,
  startDateTime: string,
  invitees: number [],                   // Won't use / don't know / N/A
  participants: number [], 
  recurrenceRule: RecurrenceRule | null,
  resourceId: number,
  resources: number [], 
  startReminder: Object,                 // Won't use / don't know / N/A
  endReminder: Object,                   // Won't use / don't know / N/A
  hideOwner: number,
  hideDetails: number
};

export interface PostReservationResponse {
  referenceNumber: string, 
  isPendingApproval: boolean             // Won't use / don't know / N/A
  links: Link [],
  message: string
};

export interface DeleteReservationResponse {
  links: Link [],
  message: string
};

interface GetReservationsResponse {
  reservations: ReservationListItem [],
  startDateTime: string,
  endDateTime: string,
  links: Link [],
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class ReservasServiceService {
  public userId: string = "";
  public sessionToken: string = "";  
  private reservationsUpdated: boolean = false;
  private apiBaseUri: string = "";
  private resourceDetailsGot: boolean = false;
  private resourceTypesGot: boolean = false;
  public credentials: { username: string, password: string } | null = null;

  // Caches
  private cacheUsersForSelection: User [] | null = null;
  private cacheUserDetails: UserDetailedSingle | null = null;
  private cacheResourceDetails: ResourceDetails [] = [];
  private cacheResourceTypes: ResourceType [] = [];

  constructor(
    public http: HttpClient
  ) {
    // Todo: from config file
    this.apiBaseUri = ConfigService.Constants.apiBaseUri;    
  }

  login (credentials: { username: string, password: string }): Observable<boolean> {
    this.credentials = credentials;
    return this.doLogin ();
  }

  clearCache () {
    console.log ("Clearing caches on exit");
    this.resourceDetailsGot = false;
    this.resourceTypesGot = false;
    this.cacheUsersForSelection = null;
    this.cacheUserDetails = null;
  }

  doLogin() {
    return Observable.create ((observer: Observer<boolean>) => {
      console.log ('Login to ' + this.apiBaseUri);
      //console.log (this.credentials);

      this.http.post<LoginResult> (
        this.apiBaseUri + 'Authentication/Authenticate',
        this.credentials,
        { 
          headers: new HttpHeaders().set(
            'Content-Type', 'application/json'
          ) 
        }
      ).subscribe (
        res => {
          if (res.isAuthenticated) {
            this.userId = res.userId;
            this.sessionToken = res.sessionToken;

            console.log('userId = ' + this.userId);
            console.log('sessionToken = ' + this.sessionToken);

            observer.next (true);
          } else {
            console.log ("doLogin false!");

            observer.next (false);
          }

          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          console.log("DOLOGIN error!");
          console.log(err.error);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
          observer.next (false);
          observer.complete ();
        }
      );
    });
  }

  signOut () {
    if (this.sessionToken != null) {
      return Observable.create ((observer: Observer<boolean>) => {
        console.log ('Login out ' + this.sessionToken + ' from ' + this.apiBaseUri);
        this.http.post (
          this.apiBaseUri + 'Authentication/SignOut',
          {
            "userId": this.userId,
            "sessionToken": this.sessionToken
          },
          { 
            headers: new HttpHeaders().set(
              'Content-Type', 'application/json'
            ) 
          }
        ).subscribe (
          res => {
            observer.next (true);
            observer.complete ();
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (false);
            observer.complete ();
          }
        );
      });  
    } else return false;
  }

  isThisOn (): Observable<boolean> {
    return Observable.create ((observer: Observer<boolean>) => {
      this.http.get<UserDetailedSingle> (
        this.apiBaseUri + 'Users/' + this.userId,
        {
          headers: new HttpHeaders()
            .set ( 'Content-Type', 'application/json' )
            .set ( 'X-Booked-SessionToken', this.sessionToken )
            .set ( 'X-Booked-UserId', this.userId )
        }
      ).subscribe (
        res => {
          observer.next (true);
          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          if (err.status === 401) {
            observer.next (false);
            observer.complete ();
          }
        }
      );
    });
  }  

  /*
  keepalive () {
    var me = this;
    setTimeout (() => {
      me.isThisOn ().subscribe (res => {
        if (!res) {
          console.log ("Keep Alive -> session expired, getting new session.");
          this.sessionToken = "";
          this.refreshing = true;
          me.doLogin ();
        } else console.log ("Keep Alive OK");
      }, (err) => console.log (err));
      me.keepalive ();
    }, 300000);
  }

  refresh() {
    console.log ("Refresh.");
    if (this.refreshing) while (this.sessionToken == "");
  }
  */

  getMinusGreenwhich () {
    let weeDate: Date = new Date ();
    let h: String = "" + Math.floor (Math.abs (weeDate.getTimezoneOffset ()) / 60);
    let m: String = "" + (Math.abs (weeDate.getTimezoneOffset ()) % 60);
    if (h.length == 1) h = "0" + h;
    if (m.length == 1) m = "0" + m;
    if (weeDate.getTimezoneOffset () < 0) return "+" + h + m; else return "-" + h + m;
  }

  getNextReservationsUser(): Observable<ReservationListItem[]> {
    // Send today as startDateTime
    // and the end of time as endDateTime

    return Observable.create ((observer: Observer<ReservationListItem[] | null>) => {
      this.http.get<GetReservationsResponse> (
        encodeURI (this.apiBaseUri + 'Reservations/?userId=' + this.userId + '&endDateTime=9999-12-31 23:59:59'),
        {
          headers: new HttpHeaders()
            .set ( 'Content-Type', 'application/json' )
            .set ( 'X-Booked-SessionToken', this.sessionToken )
            .set ( 'X-Booked-UserId', this.userId )
        }
      ).subscribe (
        res => {          
          observer.next (res.reservations);
          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          console.log(err.error);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
          observer.next (null);
          observer.complete ();
        }
      );
    });
  }

  formatDate (date: Date): string {
    var year: number = date.getFullYear ();
    var monthIndex: number = date.getMonth () + 1;
    var day: number = date.getDate ();

    var yearString: string = "" + year;
    var monthString: string = monthIndex < 10 ? "0" + monthIndex : "" + monthIndex;
    var dayString: string = day < 10 ? "0" + day : "" + day;

    console.log (yearString + "-" + monthString + "-" + dayString);
    return yearString + "-" + monthString + "-" + dayString;
  }

  getReservationsFromDate (date: Date): Observable <ReservationListItem[]> {
    return this.getReservationsUserFromDate ("-1", date);
  }

  getReservationsUserFromDate(userId: string, date: Date): Observable <ReservationListItem[]> {
    var dateFrom: Date = new Date ();
    var dateTo: Date = new Date ();
    var dateFromS: string;
    var dateToS: string;

    dateFrom.setFullYear (date.getFullYear ());
    dateFrom.setMonth (date.getMonth ());
    dateFrom.setDate (date.getDate ());
    dateFromS = this.formatDate (dateFrom);
    dateTo.setFullYear (date.getFullYear ());
    dateTo.setMonth (date.getMonth ());
    dateTo.setDate (date.getDate () + 1);
    dateToS = this.formatDate (dateTo);    

    return Observable.create ((observer: Observer<ReservationListItem[] | null>) => {
      this.http.get<GetReservationsResponse> (
        this.apiBaseUri + 'Reservations/?userId=' + userId + '&startDateTime=' + dateFromS + '&endDateTime=' + dateToS,
        {
          headers: new HttpHeaders()
            .set ( 'Content-Type', 'application/json' )
            .set ( 'X-Booked-SessionToken', this.sessionToken )
            .set ( 'X-Booked-UserId', this.userId )
        }
      ).subscribe (
        res => {
          //console.log (res.reservations);
          observer.next (res.reservations);
          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          console.log(err.error);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
          observer.next (null);
          observer.complete ();
        }
      );
    });
  }

  getReservationByReferenceNumber(referenceNumber: string): Observable<Reservation> {
    return this.http.get<Reservation> (
      this.apiBaseUri + 'Reservations/' + referenceNumber,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  getUserById (id: string): Observable<UserDetailedSingle> {
    return this.http.get<UserDetailedSingle> (
      this.apiBaseUri + 'Users/' + id,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  getUsersForSelection(): Observable<User []> {
    if (this.cacheUsersForSelection) {
      console.log ("Users for selection retrieved from cache.");
      return Observable.create ((observer: Observer<User[] | null>) => {
        observer.next (this.cacheUsersForSelection);
        observer.complete ();
      });
    } else {
      console.log ("Users for selection retrieved from WS.");
      return Observable.create ((observer: Observer<User[] | null>) => {
        this.http.get<UserDetailedResponse> (
          this.apiBaseUri + 'Users',
          {
            headers: new HttpHeaders()
              .set ( 'Content-Type', 'application/json' )
              .set ( 'X-Booked-SessionToken', this.sessionToken )
              .set ( 'X-Booked-UserId', this.userId )
          }
        ).subscribe (
          res => {
            var users: User [] = [];
            if (res.users) {
              for (let user of res.users) {
                users.push (
                  {
                    "userId": user.id,
                    "username": user.username,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "emailAddress": user.emailAddress,
                    "links": user.links,
                    "message": user.message
                  }
                );
              }
            }

            console.log (users);
            this.cacheUsersForSelection = users;
            observer.next (users);
            observer.complete ();
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (null);
            observer.complete ();
          }
        ) 
      });
    }
  }

  getUserDetails (): Observable<UserDetailedSingle> {
    if (this.cacheUserDetails) {
      console.log ("User details retrieved from cache.");
      return Observable.create ((observer: Observer<UserDetailedSingle | null>) => {
        observer.next (this.cacheUserDetails);
        observer.complete ();
      });
    } else {
      console.log ("User details retrieved from WS.");
      return Observable.create ((observer: Observer<UserDetailedSingle | null>) => {
        this.http.get<UserDetailedSingle> (
          this.apiBaseUri + 'Users/' + this.userId,
          {
            headers: new HttpHeaders() 
              .set ( 'Content-Type', 'application/json' )
              .set ( 'X-Booked-SessionToken', this.sessionToken )
              .set ( 'X-Booked-UserId', this.userId )
          }
        ).subscribe (
          res => {
            console.log ("Respuesta WS:");
            console.log (res);
            this.cacheUserDetails = res;
            observer.next (res);
            observer.complete ();
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (null);
            observer.complete ();
          }
        )
      });
    }
  }

  getResourceDetails (resourceId: number): Observable<ResourceDetails> {
    if (this.cacheResourceDetails [resourceId]) {
      console.log ("Resource details for resource " + resourceId + " retrieved from cache.");
      return Observable.create ((observer: Observer<ResourceDetails | null>) => {
        observer.next (this.cacheResourceDetails [resourceId]);
        observer.complete ();
      });
    } else {
      console.log ("Resource details for resource " + resourceId + " retrieved from WS.");
      return Observable.create ((observer: Observer<ResourceDetails | null>) => {
        this.http.get<ResourceDetails> (
          this.apiBaseUri + 'Resources/' + resourceId,
          {
            headers: new HttpHeaders()
              .set ( 'Content-Type', 'application/json' )
              .set ( 'X-Booked-SessionToken', this.sessionToken )
              .set ( 'X-Booked-UserId', this.userId )
          }
        ).subscribe (
          res => {
            this.cacheResourceDetails [resourceId] = res;
            observer.next (res);
            observer.complete ();
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (null);
            observer.complete ();
          }
        )
      });
    }
  }

  private decodeUglyEntities (s: string): string {
    let res: string;
    var element = document.createElement ("div");
    element.innerHTML = s;
    res = element.textContent != null ? element.textContent : '';
    return res;
  }

  getAllResources (): Observable<ResourceDetails []> {
    if (this.resourceDetailsGot) {
      console.log ("Resource details array retrieved from cache.");
      return Observable.create ((observer: Observer<ResourceDetails [] | null>) => {
        observer.next (this.cacheResourceDetails);
        observer.complete ();
      });
    } else {
      console.log ("Resource details array retrieved from WS.");
      return Observable.create ((observer: Observer<ResourceDetails [] | null>) => {
        this.http.get<ResourceDetailsResponse> (
          this.apiBaseUri + 'Resources/',
          {
            headers: new HttpHeaders()
              .set ( 'Content-Type', 'application/json' )
              .set ( 'X-Booked-SessionToken', this.sessionToken )
              .set ( 'X-Booked-UserId', this.userId )
          }
        ).subscribe (
          res => {
            this.cacheResourceDetails = [];
            if (res.resources) {
              for (let resource of res.resources) {
                // Parse resource names for odd HTML entities.
                resource.name = this.decodeUglyEntities (resource.name);

                // And add
                this.cacheResourceDetails [resource.resourceId] = resource;
              }
            }
            this.resourceDetailsGot = true;

            observer.next (this.cacheResourceDetails);
            observer.complete ();
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (null);
            observer.complete ();
          }
        )
      })
    }
  }

  getAllResourceTypes (): Observable<ResourceType []> {
    if (this.resourceTypesGot) {
      console.log ("Resource types array retrieved from cache.");
      return Observable.create ((observer: Observer<ResourceType [] | null>) => {
        observer.next (this.cacheResourceTypes);
        observer.complete ();
      });
    } else {
      console.log ("Resource types array retrieved from WS.");
      return Observable.create ((observer: Observer<ResourceType [] | null>) => {
        this.http.get<ResourceTypesResponse> (
          this.apiBaseUri + 'Resources/Types',
          {
            headers: new HttpHeaders ()
              .set ( 'Content-Type', 'application/json' )
              .set ( 'X-Booked-SessionToken', this.sessionToken )
              .set ( 'X-Booked-UserId', this.userId )
          }
        ).subscribe (
          res => {
            this.cacheResourceTypes = res.types;
            this.resourceTypesGot = true;

            // Parse resource type names for odd HTML entities.
            for (let resourceType of this.cacheResourceTypes) {
              resourceType.name = this.decodeUglyEntities (resourceType.name);
            }

            this.cacheResourceTypes.unshift ({id: 0, description: "- Todo -", name: "- Todo -"});

            observer.next (this.cacheResourceTypes);
            observer.complete ();            
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
            observer.next (null);
            observer.complete ();
          }
        )
      })
    }
  }

  getSecurityHash (): Observable<string> {
    console.log ("Retrieving security Hash from server");
    return Observable.create ((observer: Observer<String | null>) => {
      this.http.get<SecurityHashResponse> (
        this.apiBaseUri + 'Authentication/GetSecurityHash',
        {
          headers: new HttpHeaders ()
            .set ( 'Content-Type', 'application/json' )
            .set ( 'X-Booked-SessionToken', this.sessionToken )
            .set ( 'X-Booked-UserId', this.userId )
        }
      ).subscribe (
        res => {
          observer.next (res.hash);
          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          console.log(err.error);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
          observer.next (null);
          observer.complete ();        
        }
      )
    });
  }

  validateSecurityHash (hash: string): Observable<boolean> {
    console.log ("Validating " + hash + " with the server:");
    console.log ("Token: " + this.sessionToken + ", " + this.userId);
    return Observable.create ((observer: Observer<boolean>) => {
      this.http.post<CheckSecurityResponse> (
        this.apiBaseUri + 'Authentication/ValidateSecurityHash/' + hash,
        {},
        {
          headers: new HttpHeaders ()
            .set ( 'Content-Type', 'application/json' )
            .set ( 'X-Booked-SessionToken', this.sessionToken )
            .set ( 'X-Booked-UserId', this.userId )
        }
      ).subscribe (
        res => {
          observer.next (res.result === 'true');
          observer.complete ();
        },
        (err: HttpErrorResponse) => {
          console.log(err.error);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
          observer.next (false);
          observer.complete ();        
        }
      )
    });
  }

  postReservationCreate (reservation: PostReservationRequest): Observable<PostReservationResponse> {
    return this.http.post<PostReservationResponse> (
      this.apiBaseUri + 'Reservations/',
      reservation,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  postReservationUpdateByReferenceNumber (referenceNumber: string, reservation: PostReservationRequest): Observable<PostReservationResponse> {
    return this.http.post<PostReservationResponse> (
      this.apiBaseUri + 'Reservations/' + referenceNumber,
      reservation,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  postReservationUpdateThisByReferenceNumber (referenceNumber: string, reservation: PostReservationRequest): Observable<PostReservationResponse> {
    return this.http.post<PostReservationResponse> (
      this.apiBaseUri + 'Reservations/' + referenceNumber + '?updateScope=this',
      reservation,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  deleteReservationByReferenceNumber (referenceNumber: string): Observable<DeleteReservationResponse> {
    return this.http.delete<DeleteReservationResponse> (
      this.apiBaseUri + 'Reservations/' + referenceNumber,
      {
        headers: new HttpHeaders()
          .set ( 'Content-Type', 'application/json' )
          .set ( 'X-Booked-SessionToken', this.sessionToken )
          .set ( 'X-Booked-UserId', this.userId )
      }
    );
  }

  SetReservationsUpdated (value: boolean) {
    this.reservationsUpdated = value;
  }

  GetReservationsUpdated (): boolean {
    return this.reservationsUpdated;
  }
}
