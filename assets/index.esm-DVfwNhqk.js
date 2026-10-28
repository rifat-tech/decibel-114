import{D as le,_ as ue,E as de,L as fe,F as pe,H as he,I as ge,J as me,K as q,M as Ee}from"./firebase-DjWxGJxf.js";var Y="@firebase/ai",k="2.15.0";/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C="AI",Oe="us-central1",Re="global",_e="firebasevertexai.googleapis.com",y="v1beta",K=k,Ie="gl-js",Te="hybrid",Se=180*1e3,Ae="gemini-2.5-flash-lite";/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u extends pe{constructor(e,n,s){const o=C,a=`${o}/${e}`,i=`${o}: ${n} (${a})`;super(e,i),this.code=e,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,u),Object.setPrototypeOf(this,u.prototype),this.toString=()=>i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J=["user","model","function","system"],te={HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"},E={SAFETY:"SAFETY",RECITATION:"RECITATION",BLOCKLIST:"BLOCKLIST",PROHIBITED_CONTENT:"PROHIBITED_CONTENT",SPII:"SPII",MALFORMED_FUNCTION_CALL:"MALFORMED_FUNCTION_CALL",IMAGE_SAFETY:"IMAGE_SAFETY",IMAGE_PROHIBITED_CONTENT:"IMAGE_PROHIBITED_CONTENT",IMAGE_OTHER:"IMAGE_OTHER",NO_IMAGE:"NO_IMAGE",IMAGE_RECITATION:"IMAGE_RECITATION",LANGUAGE:"LANGUAGE",UNEXPECTED_TOOL_CALL:"UNEXPECTED_TOOL_CALL",TOO_MANY_TOOL_CALLS:"TOO_MANY_TOOL_CALLS",MISSING_THOUGHT_SIGNATURE:"MISSING_THOUGHT_SIGNATURE",MALFORMED_RESPONSE:"MALFORMED_RESPONSE"},_={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"},S={ON_DEVICE:"on_device",IN_CLOUD:"in_cloud"};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const l={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I={AGENT_PLATFORM:"AGENT_PLATFORM",VERTEX_AI:"VERTEX_AI",GOOGLE_AI:"GOOGLE_AI"};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.backendType=e}}class $ extends F{constructor(){super(I.GOOGLE_AI)}_getModelPath(e,n){return`/${y}/projects/${e}/${n}`}_getTemplatePath(e,n){return`/${y}/projects/${e}/templates/${n}`}}class x extends F{constructor(e){super(I.VERTEX_AI),this.location=Oe,e&&(this.location=e)}_getModelPath(e,n){return`/${y}/projects/${e}/locations/${this.location}/${n}`}_getTemplatePath(e,n){return`/${y}/projects/${e}/locations/${this.location}/templates/${n}`}}class G extends F{constructor(e){super(I.AGENT_PLATFORM),this.location=Re,e&&(this.location=e)}_getModelPath(e,n){return`/${y}/projects/${e}/locations/${this.location}/${n}`}_getTemplatePath(e,n){return`/${y}/projects/${e}/locations/${this.location}/templates/${n}`}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ce(t){if(t instanceof $)return`${C}/googleai`;if(t instanceof x)return`${C}/vertexai/${t.location}`;if(t instanceof G)return`${C}/agentplatform/${t.location}`;throw new u(l.ERROR,`Invalid backend: ${JSON.stringify(t.backendType)}`)}function ye(t){const e=t.split("/");if(e[0]!==C)throw new u(l.ERROR,`Invalid instance identifier, unknown prefix '${e[0]}'`);switch(e[1]){case"vertexai":const s=e[2];if(!s)throw new u(l.ERROR,`Invalid instance identifier, unknown location '${t}'`);return new x(s);case"agentplatform":const o=e[2];if(!o)throw new u(l.ERROR,`Invalid instance identifier, unknown location '${t}'`);return new G(o);case"googleai":return new $;default:throw new u(l.ERROR,`Invalid instance identifier string: '${t}'`)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const h=new fe("@firebase/vertexai");var T;(function(t){t.UNAVAILABLE="unavailable",t.DOWNLOADABLE="downloadable",t.DOWNLOADING="downloading",t.AVAILABLE="available"})(T||(T={}));/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ne={type:"text",languages:["en"]},L=[ne,{type:"image"}],D=[ne];class R{constructor(e,n,s){this.languageModelProvider=e,this.mode=n,this.downloadPromise=null,this.onDeviceParams={createOptions:{expectedInputs:L,expectedOutputs:D}},s&&(this.onDeviceParams=s,this.onDeviceParams.createOptions?(this.onDeviceParams.createOptions.expectedInputs||(this.onDeviceParams.createOptions.expectedInputs=L),this.onDeviceParams.createOptions.expectedOutputs||(this.onDeviceParams.createOptions.expectedOutputs=D)):this.onDeviceParams.createOptions={expectedInputs:L,expectedOutputs:D})}async isAvailable(e){var s;if(!this.mode)return h.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===_.ONLY_IN_CLOUD)return h.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;const n=await((s=this.languageModelProvider)==null?void 0:s.availability(this.onDeviceParams.createOptions));if(this.mode===_.ONLY_ON_DEVICE){if(n===T.UNAVAILABLE)throw new u(l.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(n===T.DOWNLOADABLE||n===T.DOWNLOADING){h.debug("Waiting for download of LanguageModel to complete.");try{await this.downloadPromise}catch(o){throw new u(l.ERROR,o.message)}return!0}return!0}return n!==T.AVAILABLE?(h.debug(`On-device inference unavailable because availability is "${n}".`),!1):R.isOnDeviceRequest(e)?!0:(h.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(e){const n=await this.createSession(),s=await Promise.all(e.contents.map(R.toLanguageModelMessage)),o=await n.prompt(s,this.onDeviceParams.promptOptions);return R.toResponse(o)}async generateContentStream(e){const n=await this.createSession(),s=await Promise.all(e.contents.map(R.toLanguageModelMessage)),o=n.promptStreaming(s,this.onDeviceParams.promptOptions);return R.toStreamResponse(o)}async countTokens(e){throw new u(l.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(e){if(e.contents.length===0)return h.debug("Empty prompt rejected for on-device inference."),!1;for(const n of e.contents){if(n.role==="function")return h.debug('"Function" role rejected for on-device inference.'),!1;for(const s of n.parts)if(s.inlineData&&R.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return h.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(e){var s;const n=await((s=this.languageModelProvider)==null?void 0:s.availability(this.onDeviceParams.createOptions));return(n===T.DOWNLOADABLE||n===T.DOWNLOADING)&&this.download(e),n}download(e){var s;if(this.downloadPromise)return;const n={...this.onDeviceParams.createOptions};n&&!n.monitor&&e&&(n.monitor=o=>{o.addEventListener("downloadprogress",a=>{e(a.loaded)})}),this.downloadPromise=(s=this.languageModelProvider)==null?void 0:s.create(n).finally(()=>{this.downloadPromise=null})}static async toLanguageModelMessage(e){const n=await Promise.all(e.parts.map(R.toLanguageModelMessageContent));return{role:R.toLanguageModelMessageRole(e.role),content:n}}static async toLanguageModelMessageContent(e){if(e.text)return{type:"text",value:e.text};if(e.inlineData){const s=await(await fetch(`data:${e.inlineData.mimeType};base64,${e.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new u(l.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(e){return e==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new u(l.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");const e=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=e,e}static toResponse(e){return{json:async()=>({candidates:[{content:{parts:[{text:e}]}}]})}}static toStreamResponse(e){const n=new TextEncoder;return{body:e.pipeThrough(new TransformStream({transform(s,o){const a=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});o.enqueue(n.encode(`data: ${a}

`))}}))}}}R.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function we(t,e,n){const o=(e||Ee()).LanguageModel;if(o&&t)return new R(o,t,n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e,n,s,o,a){this.app=e,this.backend=n,this.chromeAdapterFactory=a;const i=o==null?void 0:o.getImmediate({optional:!0}),r=s==null?void 0:s.getImmediate({optional:!0});this.auth=r||null,this.appCheck=i||null,n instanceof x||n instanceof G?this.location=n.location:this.location=""}_delete(){return Promise.resolve()}set options(e){this._options=e}get options(){return this._options}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function be(t,{instanceIdentifier:e}){if(!e)throw new u(l.ERROR,"AIService instance identifier is undefined.");const n=ye(e),s=t.getProvider("app").getImmediate(),o=t.getProvider("auth-internal"),a=t.getProvider("app-check-internal");return new Ne(s,n,o,a,we)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pe(t){var n,s,o,a,i,r,c;if((s=(n=t.app)==null?void 0:n.options)!=null&&s.apiKey)if((a=(o=t.app)==null?void 0:o.options)!=null&&a.projectId){if(!((r=(i=t.app)==null?void 0:i.options)!=null&&r.appId))throw new u(l.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.')}else throw new u(l.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new u(l.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.');const e={apiKey:t.app.options.apiKey,project:t.app.options.projectId,appId:t.app.options.appId,automaticDataCollectionEnabled:t.app.automaticDataCollectionEnabled,location:t.location,backend:t.backend};if(he(t.app)&&t.app.settings.appCheckToken){const d=t.app.settings.appCheckToken;e.getAppCheckToken=()=>Promise.resolve({token:d})}else t.appCheck&&((c=t.options)!=null&&c.useLimitedUseAppCheckTokens?e.getAppCheckToken=()=>t.appCheck.getLimitedUseToken():e.getAppCheckToken=()=>t.appCheck.getToken());return t.auth&&(e.getAuthToken=()=>t.auth.getToken()),e}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e,n){this._apiSettings=Pe(e),this.model=N.normalizeModelName(n,this._apiSettings.backend.backendType)}static normalizeModelName(e,n){return n===I.GOOGLE_AI?N.normalizeGoogleAIModelName(e):N.normalizeVertexAIModelName(e)}static normalizeGoogleAIModelName(e){return`models/${e}`}static normalizeVertexAIModelName(e){let n;return e.includes("/")?e.startsWith("models/")?n=`publishers/google/${e}`:n=e:n=`publishers/google/models/${e}`,n}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Le="Timeout has expired.",M="AbortError";class De{constructor(e){this.params=e}toString(){const e=new URL(this.baseUrl);return e.pathname=this.pathname,e.search=this.queryParams.toString(),e.toString()}get pathname(){return this.params.templateId?`${this.params.apiSettings.backend._getTemplatePath(this.params.apiSettings.project,this.params.templateId)}:${this.params.task}`:`${this.params.apiSettings.backend._getModelPath(this.params.apiSettings.project,this.params.model)}:${this.params.task}`}get baseUrl(){var e;return((e=this.params.singleRequestOptions)==null?void 0:e.baseUrl)??`https://${_e}`}get queryParams(){const e=new URLSearchParams;return this.params.stream&&e.set("alt","sse"),e}}function Me(t){const e=[];return e.push(`${Ie}/${K}`),e.push(`fire/${K}`),(t.params.apiSettings.inferenceMode===_.PREFER_ON_DEVICE||t.params.apiSettings.inferenceMode===_.PREFER_IN_CLOUD)&&e.push(Te),e.join(" ")}async function ve(t){const e=new Headers;if(e.append("Content-Type","application/json"),e.append("x-goog-api-client",Me(t)),e.append("x-goog-api-key",t.params.apiSettings.apiKey),t.params.apiSettings.automaticDataCollectionEnabled&&e.append("X-Firebase-Appid",t.params.apiSettings.appId),t.params.apiSettings.getAppCheckToken){const n=await t.params.apiSettings.getAppCheckToken();n&&(e.append("X-Firebase-AppCheck",n.token),n.error&&h.warn(`Unable to obtain a valid App Check token: ${n.error.message}`))}if(t.params.apiSettings.getAuthToken){const n=await t.params.apiSettings.getAuthToken();n&&e.append("Authorization",`Firebase ${n.accessToken}`)}return e}async function U(t,e){var d,g;const n=new De(t);let s;const o=(d=t.singleRequestOptions)==null?void 0:d.signal,a=((g=t.singleRequestOptions)==null?void 0:g.timeout)!=null&&t.singleRequestOptions.timeout>=0?t.singleRequestOptions.timeout:Se,i=new AbortController,r=setTimeout(()=>{i.abort(new DOMException(Le,M)),h.debug(`Aborting request to ${n} due to timeout (${a}ms)`)},a),c=AbortSignal.any(o?[o,i.signal]:[i.signal]);if(o&&o.aborted)throw clearTimeout(r),new DOMException(o.reason??"Aborted externally before fetch",M);try{const f={method:"POST",headers:await ve(n),signal:c,body:e};if(s=await fetch(n.toString(),f),!s.ok){let O="",p;try{const m=await s.json();O=m.error.message,m.error.details&&(O+=` ${JSON.stringify(m.error.details)}`,p=m.error.details)}catch{}throw s.status===403&&p&&p.some(m=>m.reason==="SERVICE_DISABLED")&&p.some(m=>{var j,H;return(H=(j=m.links)==null?void 0:j[0])==null?void 0:H.description.includes("Google developers console API activation")})?new u(l.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${n.params.apiSettings.project}/ailogic/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:s.status,statusText:s.statusText,errorDetails:p}):new u(l.FETCH_ERROR,`Error fetching from ${n}: [${s.status} ${s.statusText}] ${O}`,{status:s.status,statusText:s.statusText,errorDetails:p})}}catch(f){let O=f;throw f.code!==l.FETCH_ERROR&&f.code!==l.API_NOT_ENABLED&&f instanceof Error&&f.name!==M&&(O=new u(l.ERROR,`Error fetching from ${n.toString()}: ${f.message}`),O.stack=f.stack),O}finally{clearTimeout(r)}return s}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b(t){if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&h.warn(`This response had ${t.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),oe(t.candidates[0]))throw new u(l.RESPONSE_ERROR,`Response error: ${A(t)}. Response body stored in error.response`,{response:t});return!0}else return!1}function P(t,e=S.IN_CLOUD){t.candidates&&!t.candidates[0].hasOwnProperty("index")&&(t.candidates[0].index=0);const n=ke(t);return n.inferenceSource=e,n}function ke(t){return t.text=()=>{if(b(t))return W(t,e=>!e.thought);if(t.promptFeedback)throw new u(l.RESPONSE_ERROR,`Text not available. ${A(t)}`,{response:t});return""},t.thoughtSummary=()=>{if(b(t)){const e=W(t,n=>!!n.thought);return e===""?void 0:e}else if(t.promptFeedback)throw new u(l.RESPONSE_ERROR,`Thought summary not available. ${A(t)}`,{response:t})},t.inlineDataParts=()=>{if(b(t))return Fe(t);if(t.promptFeedback)throw new u(l.RESPONSE_ERROR,`Data not available. ${A(t)}`,{response:t})},t.functionCalls=()=>{if(b(t))return se(t);if(t.promptFeedback)throw new u(l.RESPONSE_ERROR,`Function call not available. ${A(t)}`,{response:t})},t}function W(t,e){var s,o,a,i;const n=[];if((o=(s=t.candidates)==null?void 0:s[0].content)!=null&&o.parts)for(const r of(i=(a=t.candidates)==null?void 0:a[0].content)==null?void 0:i.parts)r.text&&e(r)&&n.push(r.text);return n.length>0?n.join(""):""}function se(t){var n,s,o,a;if(!t)return;const e=[];if((s=(n=t.candidates)==null?void 0:n[0].content)!=null&&s.parts)for(const i of(a=(o=t.candidates)==null?void 0:o[0].content)==null?void 0:a.parts)i.functionCall&&e.push(i.functionCall);if(e.length>0)return e}function Fe(t){var n,s,o,a;const e=[];if((s=(n=t.candidates)==null?void 0:n[0].content)!=null&&s.parts)for(const i of(a=(o=t.candidates)==null?void 0:o[0].content)==null?void 0:a.parts)i.inlineData&&e.push(i);if(e.length>0)return e}const $e=[E.RECITATION,E.SAFETY,E.BLOCKLIST,E.PROHIBITED_CONTENT,E.SPII,E.MALFORMED_FUNCTION_CALL,E.IMAGE_SAFETY,E.IMAGE_PROHIBITED_CONTENT,E.IMAGE_OTHER,E.NO_IMAGE,E.IMAGE_RECITATION,E.LANGUAGE,E.UNEXPECTED_TOOL_CALL,E.TOO_MANY_TOOL_CALLS,E.MISSING_THOUGHT_SIGNATURE,E.MALFORMED_RESPONSE];function oe(t){return!!t.finishReason&&$e.some(e=>e===t.finishReason)}function A(t){var n,s,o;let e="";if((!t.candidates||t.candidates.length===0)&&t.promptFeedback)e+="Response was blocked",(n=t.promptFeedback)!=null&&n.blockReason&&(e+=` due to ${t.promptFeedback.blockReason}`),(s=t.promptFeedback)!=null&&s.blockReasonMessage&&(e+=`: ${t.promptFeedback.blockReasonMessage}`);else if((o=t.candidates)!=null&&o[0]){const a=t.candidates[0];oe(a)&&(e+=`Candidate was blocked due to ${a.finishReason}`,a.finishMessage&&(e+=`: ${a.finishMessage}`))}return e}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ae(t){var e,n;if((e=t.safetySettings)==null||e.forEach(s=>{if(s.method)throw new u(l.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),(n=t.generationConfig)!=null&&n.topK){const s=Math.round(t.generationConfig.topK);s!==t.generationConfig.topK&&(h.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),t.generationConfig.topK=s)}return t}function V(t){return{candidates:t.candidates?Ge(t.candidates):void 0,prompt:t.promptFeedback?Ue(t.promptFeedback):void 0,usageMetadata:t.usageMetadata}}function xe(t,e){return{generateContentRequest:{model:e,...t}}}function Ge(t){const e=[];let n;return e&&t.forEach(s=>{var i,r;let o;if(s.citationMetadata&&(o={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(n=s.safetyRatings.map(c=>({...c,severity:c.severity??te.HARM_SEVERITY_UNSUPPORTED,probabilityScore:c.probabilityScore??0,severityScore:c.severityScore??0}))),(r=(i=s.content)==null?void 0:i.parts)!=null&&r.some(c=>c==null?void 0:c.videoMetadata))throw new u(l.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");const a={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:n,citationMetadata:o,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};e.push(a)}),e}function Ue(t){const e=[];return t.safetyRatings.forEach(s=>{e.push({category:s.category,probability:s.probability,severity:s.severity??te.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:t.blockReason,safetyRatings:e,blockReasonMessage:t.blockReasonMessage}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function Ve(t,e,n){const s=t.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),o=qe(s),[a,i]=o.tee(),{response:r,firstValue:c}=await Be(i,e,n);return{stream:He(a,e,n),response:r,firstValue:c}}async function Be(t,e,n){const[s,o]=t.tee(),a=s.getReader(),{value:i}=await a.read();return{firstValue:i,response:je(o,e,n)}}async function je(t,e,n){const s=[],o=t.getReader();for(;;){const{done:a,value:i}=await o.read();if(a){let r=Ye(s);return e.backend.backendType===I.GOOGLE_AI&&(r=V(r)),P(r,n)}s.push(i)}}async function*He(t,e,n){var o,a;const s=t.getReader();for(;;){const{value:i,done:r}=await s.read();if(r)break;let c;e.backend.backendType===I.GOOGLE_AI?c=P(V(i),n):c=P(i,n);const d=(o=c.candidates)==null?void 0:o[0];!((a=d==null?void 0:d.content)!=null&&a.parts)&&!(d!=null&&d.finishReason)&&!(d!=null&&d.citationMetadata)&&!(d!=null&&d.urlContextMetadata)||(yield c)}}function qe(t){const e=t.getReader();return new ReadableStream({start(s){let o="";return a();function a(){return e.read().then(({value:i,done:r})=>{if(r){if(o.trim()){s.error(new u(l.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}o+=i;let c=o.match(X),d;for(;c;){try{d=JSON.parse(c[1])}catch{s.error(new u(l.PARSE_FAILED,`Error parsing JSON response: "${c[1]}`));return}s.enqueue(d),o=o.substring(c[0].length),c=o.match(X)}return a()})}}})}function Ye(t){const e=t[t.length-1],n={promptFeedback:e==null?void 0:e.promptFeedback};for(const s of t)if(s.candidates)for(const o of s.candidates){const a=o.index||0;n.candidates||(n.candidates=[]),n.candidates[a]||(n.candidates[a]={index:o.index}),n.candidates[a].citationMetadata=o.citationMetadata,n.candidates[a].finishReason=o.finishReason,n.candidates[a].finishMessage=o.finishMessage,n.candidates[a].safetyRatings=o.safetyRatings,n.candidates[a].groundingMetadata=o.groundingMetadata;const i=o.urlContextMetadata;if(typeof i=="object"&&i!==null&&Object.keys(i).length>0&&(n.candidates[a].urlContextMetadata=i),o.content){if(!o.content.parts)continue;n.candidates[a].content||(n.candidates[a].content={role:o.content.role||"user",parts:[]});for(const r of o.content.parts){const c={...r};r.text!==""&&Object.keys(c).length>0&&n.candidates[a].content.parts.push(c)}}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ke=[l.FETCH_ERROR,l.ERROR,l.API_NOT_ENABLED];async function ie(t,e,n,s){if(!e)return{response:await s(),inferenceSource:S.IN_CLOUD};switch(e.mode){case _.ONLY_ON_DEVICE:if(await e.isAvailable(t))return{response:await n(),inferenceSource:S.ON_DEVICE};throw new u(l.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case _.ONLY_IN_CLOUD:return{response:await s(),inferenceSource:S.IN_CLOUD};case _.PREFER_IN_CLOUD:try{return{response:await s(),inferenceSource:S.IN_CLOUD}}catch(o){if(o instanceof u&&Ke.includes(o.code)&&await e.isAvailable(t))return{response:await n(),inferenceSource:S.ON_DEVICE};throw o}case _.PREFER_ON_DEVICE:return await e.isAvailable(t)?{response:await n(),inferenceSource:S.ON_DEVICE}:{response:await s(),inferenceSource:S.IN_CLOUD};default:throw new u(l.ERROR,`Unexpected infererence mode: ${e.mode}`)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Je(t,e,n,s){return t.backend.backendType===I.GOOGLE_AI&&(n=ae(n)),U({task:"streamGenerateContent",model:e,apiSettings:t,stream:!0,singleRequestOptions:s},JSON.stringify(n))}async function re(t,e,n,s,o){const a=await ie(n,s,()=>s.generateContentStream(n),()=>Je(t,e,n,o));return Ve(a.response,t,a.inferenceSource)}async function We(t,e,n,s){return t.backend.backendType===I.GOOGLE_AI&&(n=ae(n)),U({model:e,task:"generateContent",apiSettings:t,stream:!1,singleRequestOptions:s},JSON.stringify(n))}async function ce(t,e,n,s,o){const a=await ie(n,s,()=>s.generateContent(n),()=>We(t,e,n,o)),i=await Xe(a.response,t);return{response:P(i,a.inferenceSource)}}async function Xe(t,e){const n=await t.json();return e.backend.backendType===I.GOOGLE_AI?V(n):n}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(t){if(t!=null){if(typeof t=="string")return{role:"system",parts:[{text:t}]};if(t.text)return{role:"system",parts:[t]};if(t.parts)return t.role?t:{role:"system",parts:t.parts}}}function w(t){let e=[];if(typeof t=="string")e=[{text:t}];else for(const n of t)typeof n=="string"?e.push({text:n}):e.push(n);return ze(e)}function ze(t){const e={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const a of t)"functionResponse"in a?(n.parts.push(a),o=!0):(e.parts.push(a),s=!0);if(s&&o)throw new u(l.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!s&&!o)throw new u(l.INVALID_CONTENT,"No Content is provided for sending chat message.");return s?e:n}function v(t){let e;return t.contents?e=t:e={contents:[w(t)]},t.systemInstruction&&(e.systemInstruction=B(t.systemInstruction)),e}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const z="SILENT_ERROR",Q=10;class Qe{constructor(e,n,s){this.params=n,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=e}async getHistory(){return await this._sendPromise,this._history}async _sendMessage(e,n){let s={};await this._sendPromise;const o=[];return this._sendPromise=this._sendPromise.then(async()=>{var c,d,g;let a,i=0;const r=((c=this.requestOptions)==null?void 0:c.maxSequentialFunctionCalls)??Q;do{let f;if(a){i++;const m=await this._callFunctionsAsNeeded(a);f=w(m)}else f=w(e);const O=this._formatRequest(f,[...o]);o.push(f);const p=await this._callGenerateContent(O,n);if(p)if(s=p,a=this._getCallableFunctionCalls(p.response),p.response.candidates&&p.response.candidates.length>0){const m={parts:((d=p.response.candidates)==null?void 0:d[0].content.parts)||[],role:((g=p.response.candidates)==null?void 0:g[0].content.role)||"model"};o.push(m)}else{const m=A(p.response);m&&h.warn(`sendMessage() was unsuccessful. ${m}. Inspect response object for details.`)}else a=void 0}while(a&&i<r);a&&i>=r&&h.warn(`Automatic function calling exceeded the limit of ${r} function calls. Returning last model response.`)}),await this._sendPromise,this._history=this._history.concat(o),s}async _sendMessageStream(e,n){await this._sendPromise;const s=[],a=(async()=>{var g;let i,r=0;const c=((g=this.requestOptions)==null?void 0:g.maxSequentialFunctionCalls)??Q;let d;do{let f;if(i){r++;const p=await this._callFunctionsAsNeeded(i);f=w(p)}else f=w(e);const O=this._formatRequest(f,[...s]);if(s.push(f),d=await this._callGenerateContentStream(O,n),i=this._getCallableFunctionCalls(d.firstValue),i&&d.firstValue&&d.firstValue.candidates&&d.firstValue.candidates.length>0){const p={...d.firstValue.candidates[0].content};p.role||(p.role="model"),s.push(p)}}while(i&&r<c);return i&&r>=c&&h.warn(`Automatic function calling exceeded the limit of ${c} function calls. Returning last model response.`),{stream:d.stream,response:d.response}})();return this._sendPromise=this._sendPromise.then(async()=>a).catch(i=>{throw new Error(z)}).then(i=>i.response).then(i=>{if(i.candidates&&i.candidates.length>0){this._history=this._history.concat(s);const r={...i.candidates[0].content};r.role||(r.role="model"),this._history.push(r)}else{const r=A(i);r&&h.warn(`sendMessageStream() was unsuccessful. ${r}. Inspect response object for details.`)}}).catch(i=>{i.message!==z&&i.name!=="AbortError"&&h.error(i)}),a}_getCallableFunctionCalls(e){var o,a,i;const n=(a=(o=this.params)==null?void 0:o.tools)==null?void 0:a.find(r=>r.functionDeclarations);if(!(n!=null&&n.functionDeclarations))return;const s=se(e);if(s){for(const r of s)if(!((i=n.functionDeclarations)==null?void 0:i.some(d=>d.name===r.name&&typeof d.functionReference=="function")))return;return s}}async _callFunctionsAsNeeded(e){var a,i;const n=[],s=[],o=(i=(a=this.params)==null?void 0:a.tools)==null?void 0:i.find(r=>r.functionDeclarations);if(o&&o.functionDeclarations){for(const c of e){const d=o.functionDeclarations.find(g=>g.name===c.name);if(d!=null&&d.functionReference){const g=Promise.resolve(d.functionReference(c.args)).catch(f=>{const O=new u(l.ERROR,`Error in user-defined function "${d.name}": ${f.message}`);throw O.stack=f.stack,O});n.push({name:c.name,id:c.id,results:g}),s.push(g)}}await Promise.all(s);const r=[];for(const{name:c,id:d,results:g}of n){const f={name:c,response:await g};d&&(f.id=d),r.push({functionResponse:f})}return r}else throw new u(l.REQUEST_ERROR,'No function declarations were provided in "tools".')}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],Ze={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},ee={user:["model"],function:["model"],model:["user","function"],system:[]};function et(t){let e=null;for(const n of t){const{role:s,parts:o}=n;if(!e&&s!=="user")throw new u(l.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!J.includes(s))throw new u(l.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(J)}`);if(!Array.isArray(o))throw new u(l.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(o.length===0)throw new u(l.INVALID_CONTENT,"Each Content should have at least one part");const a={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,executableCode:0,codeExecutionResult:0};for(const r of o)for(const c of Z)c in r&&(a[c]+=1);const i=Ze[s];for(const r of Z)if(!i.includes(r)&&a[r]>0)throw new u(l.INVALID_CONTENT,`Content with role '${s}' can't contain '${r}' part`);if(e&&!ee[s].includes(e.role))throw new u(l.INVALID_CONTENT,`Content with role '${s}' can't follow '${e.role}'. Valid previous roles: ${JSON.stringify(ee)}`);e=n}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt extends Qe{constructor(e,n,s,o,a){var i;super(e,o,a),this.model=n,this.chromeAdapter=s,this.params=o,this.requestOptions=a,o!=null&&o.history&&(et(o.history),this._history=o.history),((i=this.params)==null?void 0:i.systemInstruction)!=null&&(this.params={...this.params,systemInstruction:B(this.params.systemInstruction)})}_formatRequest(e,n){var s,o,a,i,r;return{safetySettings:(s=this.params)==null?void 0:s.safetySettings,generationConfig:(o=this.params)==null?void 0:o.generationConfig,tools:(a=this.params)==null?void 0:a.tools,toolConfig:(i=this.params)==null?void 0:i.toolConfig,systemInstruction:(r=this.params)==null?void 0:r.systemInstruction,contents:[...this._history,...n,e]}}_callGenerateContent(e,n){return ce(this._apiSettings,this.model,e,this.chromeAdapter,{...this.requestOptions,...n})}_callGenerateContentStream(e,n){return re(this._apiSettings,this.model,e,this.chromeAdapter,{...this.requestOptions,...n})}async sendMessage(e,n){return this._sendMessage(e,n)}async sendMessageStream(e,n){return this._sendMessageStream(e,n)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nt(t,e,n,s){let o="";if(t.backend.backendType===I.GOOGLE_AI){const i=xe(n,e);o=JSON.stringify(i)}else o=JSON.stringify(n);return(await U({model:e,task:"countTokens",apiSettings:t,stream:!1,singleRequestOptions:s},o)).json()}async function st(t,e,n,s,o){if((s==null?void 0:s.mode)===_.ONLY_ON_DEVICE)throw new u(l.UNSUPPORTED,"countTokens() is not supported for on-device models.");return nt(t,e,n,o)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot extends N{constructor(e,n,s,o){super(e,n.model),this.chromeAdapter=o,this.generationConfig=n.generationConfig||{},at(this.generationConfig),this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=B(n.systemInstruction),this.requestOptions=s||{}}async initializeDeviceModel(e){if(!this.chromeAdapter||this.chromeAdapter.mode===_.ONLY_IN_CLOUD)return;if(await this.chromeAdapter.downloadIfAvailable(e)===T.UNAVAILABLE){const s=new u(l.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(this.chromeAdapter.mode===_.ONLY_ON_DEVICE)throw s;h.debug(s.message)}await this.chromeAdapter.downloadPromise}async generateContent(e,n){const s=v(e);return ce(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n})}async generateContentStream(e,n){const s=v(e),{stream:o,response:a}=await re(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n});return{stream:o,response:a}}startChat(e){return new tt(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...e},this.requestOptions)}async countTokens(e,n){const s=v(e);return st(this._apiSettings,this.model,s,this.chromeAdapter,{...this.requestOptions,...n})}}function at(t){var e,n;if(((e=t.thinkingConfig)==null?void 0:e.thinkingBudget)!=null&&((n=t.thinkingConfig)!=null&&n.thinkingLevel))throw new u(l.UNSUPPORTED,"Cannot set both thinkingBudget and thinkingLevel in a config.");if(t.responseSchema!=null&&t.responseJsonSchema!=null)throw new u(l.UNSUPPORTED,"Cannot set both responseSchema and responseJsonSchema in a config.");if((t.responseSchema!=null||t.responseJsonSchema!=null)&&t.responseMimeType!=="application/json")throw new u(l.UNSUPPORTED,'responseMimeType must be set to "application/json" if responseSchema or responseJsonSchema are set.')}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lt(t=de(),e){t=le(t);const n=ue(t,C),s=(e==null?void 0:e.backend)??new $,o={useLimitedUseAppCheckTokens:(e==null?void 0:e.useLimitedUseAppCheckTokens)??!1},a=Ce(s),i=n.getImmediate({identifier:a});return i.options=o,i}const it=["mode","onDeviceParams","inCloudParams"];function ut(t,e,n){var r;const s=e;let o;if(s.mode){for(const c of Object.keys(e))it.includes(c)||h.warn(`When a hybrid inference mode is specified (mode is currently set to ${s.mode}), "${c}" cannot be configured at the top level. Configuration for in-cloud and on-device must be done separately in inCloudParams and onDeviceParams. Configuration values set outside of inCloudParams and onDeviceParams will be ignored.`);o=s.inCloudParams||{model:Ae}}else o=e;if(!o.model)throw new u(l.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");const a=(r=t.chromeAdapterFactory)==null?void 0:r.call(t,s.mode,typeof window>"u"?void 0:window,s.onDeviceParams),i=new ot(t,o,n,a);return i._apiSettings.inferenceMode=s.mode,i}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rt(){ge(new me(C,be,"PUBLIC").setMultipleInstances(!0)),q(Y,k),q(Y,k,"esm2020")}rt();export{u as AIError,l as AIErrorCode,N as AIModel,G as AgentPlatformBackend,F as Backend,I as BackendType,tt as ChatSession,Qe as ChatSessionBase,E as FinishReason,ot as GenerativeModel,$ as GoogleAIBackend,te as HarmSeverity,_ as InferenceMode,S as InferenceSource,J as POSSIBLE_ROLES,x as VertexAIBackend,lt as getAI,ut as getGenerativeModel};
