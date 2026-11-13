# Changelog

## [0.3.0](https://github.com/nedhmn/goat-format-chatbot/compare/v0.2.0...v0.3.0) (2026-11-13)


### Features

* **backend:** set the question limits from the environment ([#166](https://github.com/nedhmn/goat-format-chatbot/issues/166)) ([3b60d24](https://github.com/nedhmn/goat-format-chatbot/commit/3b60d24450474dae1c684c5c8e9865c8282dd1b5))
* **evals:** score rulings answers in langfuse experiments ([#164](https://github.com/nedhmn/goat-format-chatbot/issues/164)) ([ccc9fd7](https://github.com/nedhmn/goat-format-chatbot/commit/ccc9fd78ca78baf3aa74cfa76b5c54b08ca227d1))

## [0.2.0](https://github.com/nedhmn/goat-format-chatbot/compare/v0.1.0...v0.2.0) (2026-11-13)


### Features

* **web:** answer typed questions in the demo ([#153](https://github.com/nedhmn/goat-format-chatbot/issues/153)) ([a0c22de](https://github.com/nedhmn/goat-format-chatbot/commit/a0c22de64fb4f302a39f315370e27ecf2e39e97f))
* **web:** offer the preset questions in the demo fallback ([#159](https://github.com/nedhmn/goat-format-chatbot/issues/159)) ([6263397](https://github.com/nedhmn/goat-format-chatbot/commit/626339706ccd411064a68ad192f04d2db59cac15))
* **web:** open recorded threads from the demo examples ([#138](https://github.com/nedhmn/goat-format-chatbot/issues/138)) ([331532f](https://github.com/nedhmn/goat-format-chatbot/commit/331532f09dcf338c1e5f0f738e7600a413a157cf))
* **web:** play preset answers back live in the demo ([#150](https://github.com/nedhmn/goat-format-chatbot/issues/150)) ([05d0aac](https://github.com/nedhmn/goat-format-chatbot/commit/05d0aac0ae2003b0291298c897985f968ebf10d8))
* **web:** point the demo input at the preset questions ([#156](https://github.com/nedhmn/goat-format-chatbot/issues/156)) ([7642408](https://github.com/nedhmn/goat-format-chatbot/commit/7642408baf6c62e1584b9205698774dd3b317a3d))
* **web:** record the demo threads with one command ([#135](https://github.com/nedhmn/goat-format-chatbot/issues/135)) ([3292686](https://github.com/nedhmn/goat-format-chatbot/commit/3292686b260ae853b0d0097348b78ae1790fada7))
* **web:** replay recorded threads in the demo ([#136](https://github.com/nedhmn/goat-format-chatbot/issues/136)) ([fb5672a](https://github.com/nedhmn/goat-format-chatbot/commit/fb5672a10a299d9b58c5cdeb19c84e78076786e0))
* **web:** shorten the demo answers ([#157](https://github.com/nedhmn/goat-format-chatbot/issues/157)) ([0897c4a](https://github.com/nedhmn/goat-format-chatbot/commit/0897c4a287a5aeefc44e3956d902bbf81b345f15))
* **web:** show preset questions above the demo input ([#152](https://github.com/nedhmn/goat-format-chatbot/issues/152)) ([b545efb](https://github.com/nedhmn/goat-format-chatbot/commit/b545efb8c13fc8a18fe9455ddb6a603b168f9ed0))


### Performance

* **web:** keep the demo recording out of the live app ([#143](https://github.com/nedhmn/goat-format-chatbot/issues/143)) ([e022e04](https://github.com/nedhmn/goat-format-chatbot/commit/e022e044164a0944b6874e58373d3c1d6c4091cc))

## 0.1.0 (2026-11-13)


### Features

* **backend:** add the cards and passages tables ([#59](https://github.com/nedhmn/goat-format-chatbot/issues/59)) ([339986f](https://github.com/nedhmn/goat-format-chatbot/commit/339986f36c460341fe7a22528dc36fd592842351))
* **backend:** add the convex backend package ([#38](https://github.com/nedhmn/goat-format-chatbot/issues/38)) ([97580d0](https://github.com/nedhmn/goat-format-chatbot/commit/97580d0f3eb7d030e1caa2915c3006fbe17535d8))
* **backend:** answer a question with the rulings agent ([#71](https://github.com/nedhmn/goat-format-chatbot/issues/71)) ([b010f62](https://github.com/nedhmn/goat-format-chatbot/commit/b010f62a6b0bdaec727799fe9584a7a6cd354633))
* **backend:** ground the agent's answers in cited rulings ([#75](https://github.com/nedhmn/goat-format-chatbot/issues/75)) ([c7f2e0a](https://github.com/nedhmn/goat-format-chatbot/commit/c7f2e0a1ff2229d9e6bbc6e61ccdb93c413bf11f))
* **backend:** ingest cards and rulings with one command ([#62](https://github.com/nedhmn/goat-format-chatbot/issues/62)) ([46460e8](https://github.com/nedhmn/goat-format-chatbot/commit/46460e833a1bfac631bed87798848ec96ba7412d))
* **backend:** ingest ruling notices and learn pages as passages ([#63](https://github.com/nedhmn/goat-format-chatbot/issues/63)) ([fd9bc22](https://github.com/nedhmn/goat-format-chatbot/commit/fd9bc22f4f7dfd9ebec3a9268db12f3c8fa4f9da))
* **backend:** let the agent read a card and search passages ([#74](https://github.com/nedhmn/goat-format-chatbot/issues/74)) ([42921c7](https://github.com/nedhmn/goat-format-chatbot/commit/42921c739e80988b278d56c1f500a4447934b344))
* **backend:** limit how often questions can be sent ([#82](https://github.com/nedhmn/goat-format-chatbot/issues/82)) ([eee927f](https://github.com/nedhmn/goat-format-chatbot/commit/eee927f89f2080df80aac94045015e31d290fec6))
* **backend:** link passages to the cards they mention ([#65](https://github.com/nedhmn/goat-format-chatbot/issues/65)) ([76c8078](https://github.com/nedhmn/goat-format-chatbot/commit/76c807863ad73ea4dd50a48c5b383c05944ca903))
* **backend:** list past threads titled by their first question ([#89](https://github.com/nedhmn/goat-format-chatbot/issues/89)) ([1e46330](https://github.com/nedhmn/goat-format-chatbot/commit/1e46330085d7d4b7104bd3f6b5e8ec2f57a83f45))
* **backend:** look up a card by a loosely typed name ([#72](https://github.com/nedhmn/goat-format-chatbot/issues/72)) ([c05a524](https://github.com/nedhmn/goat-format-chatbot/commit/c05a5246e7dad3bce4ab78b9ca67ab8a0e8894fb))
* **backend:** pin, rename, and delete threads ([#124](https://github.com/nedhmn/goat-format-chatbot/issues/124)) ([4ffc294](https://github.com/nedhmn/goat-format-chatbot/commit/4ffc2944e6eb4ef71fc44455f98a1db38903901d))
* **backend:** read cards and rulings from the goatformat api ([#60](https://github.com/nedhmn/goat-format-chatbot/issues/60)) ([60c94d7](https://github.com/nedhmn/goat-format-chatbot/commit/60c94d7add1939817cec2fb8649adfc88e95f948))
* **backend:** send a question and stream the answer into its thread ([#81](https://github.com/nedhmn/goat-format-chatbot/issues/81)) ([ed15ece](https://github.com/nedhmn/goat-format-chatbot/commit/ed15ece567a8380a80746cc95db23763752d20b4))
* **design-system:** add a sidebar footer and dropdown menu ([#113](https://github.com/nedhmn/goat-format-chatbot/issues/113)) ([c671159](https://github.com/nedhmn/goat-format-chatbot/commit/c6711591b3303e564fc21fac3589f4d2948d4689))
* **design-system:** add an alert dialog ([#125](https://github.com/nedhmn/goat-format-chatbot/issues/125)) ([f2cddf6](https://github.com/nedhmn/goat-format-chatbot/commit/f2cddf647d4df2a79e0c87df7cd0c0c8519c0eb0))
* **design-system:** add shadcn ai elements components with the brand theme ([#84](https://github.com/nedhmn/goat-format-chatbot/issues/84)) ([91ad5d7](https://github.com/nedhmn/goat-format-chatbot/commit/91ad5d7c461ea2720f08b7b95cb088a5493b65ba))
* **design-system:** port the design system on base ui ([#8](https://github.com/nedhmn/goat-format-chatbot/issues/8)) ([ac24366](https://github.com/nedhmn/goat-format-chatbot/commit/ac243667cf2bb62985ded919dbec740f99c77ab4))
* list past questions by last activity ([#121](https://github.com/nedhmn/goat-format-chatbot/issues/121)) ([efbd1a6](https://github.com/nedhmn/goat-format-chatbot/commit/efbd1a6a3d35496e4e835a6b2eb3edd3a0c187f2))
* name the browser tab after the open thread ([#128](https://github.com/nedhmn/goat-format-chatbot/issues/128)) ([5dd878e](https://github.com/nedhmn/goat-format-chatbot/commit/5dd878e4f3e3ceb7859752e3a4ff39781b47d8de))
* tighten the sidebar to a 240px column and 64px rail ([#92](https://github.com/nedhmn/goat-format-chatbot/issues/92)) ([e138970](https://github.com/nedhmn/goat-format-chatbot/commit/e13897097d6640faf2606447b7653001b85fc4bc))
* **web:** add tanstack router with the chat routes ([#47](https://github.com/nedhmn/goat-format-chatbot/issues/47)) ([271abfc](https://github.com/nedhmn/goat-format-chatbot/commit/271abfc6597f0da459326b593e1f32ff1d054b07))
* **web:** ask a rulings question and watch the answer stream in ([#85](https://github.com/nedhmn/goat-format-chatbot/issues/85)) ([2522560](https://github.com/nedhmn/goat-format-chatbot/commit/252256099394c52ba98992a653128856c49152a8))
* **web:** connect to the local convex backend through tanstack query ([#49](https://github.com/nedhmn/goat-format-chatbot/issues/49)) ([24d8aeb](https://github.com/nedhmn/goat-format-chatbot/commit/24d8aebffe9a8f78e80973e9a8e33a4cc8b3a957))
* **web:** group past questions by when they were active ([#122](https://github.com/nedhmn/goat-format-chatbot/issues/122)) ([7bd9c4a](https://github.com/nedhmn/goat-format-chatbot/commit/7bd9c4a3d1902c6fb433f5c0a2713c86c65e6c0a))
* **web:** move to react and tailwind on the design system ([#9](https://github.com/nedhmn/goat-format-chatbot/issues/9)) ([b2e6687](https://github.com/nedhmn/goat-format-chatbot/commit/b2e66879a580c441ad19d384834be02960879520))
* **web:** pick a light, dark, or system theme from a user menu ([#115](https://github.com/nedhmn/goat-format-chatbot/issues/115)) ([539fc47](https://github.com/nedhmn/goat-format-chatbot/commit/539fc47ca73ec882d3bfd3ccd9ff37157f2d10fe))
* **web:** pin, rename, and delete past questions ([#126](https://github.com/nedhmn/goat-format-chatbot/issues/126)) ([584e9c6](https://github.com/nedhmn/goat-format-chatbot/commit/584e9c6166bad7752092a5f116ade0dfbc178f8e))
* **web:** reopen past questions from a sidebar ([#90](https://github.com/nedhmn/goat-format-chatbot/issues/90)) ([a7ae065](https://github.com/nedhmn/goat-format-chatbot/commit/a7ae065c7c3b4f8b39dcb8d83b0914e0ad84f036))
* **web:** show when each answer was given ([#112](https://github.com/nedhmn/goat-format-chatbot/issues/112)) ([76b65ab](https://github.com/nedhmn/goat-format-chatbot/commit/76b65ab6e1392a3c6fcd576c889d7cddd1f4e14e))
* **web:** validate env vars with t3 env ([#53](https://github.com/nedhmn/goat-format-chatbot/issues/53)) ([eab9681](https://github.com/nedhmn/goat-format-chatbot/commit/eab9681cfb9a0d83bfbc215f210b5b45bcd8149a))


### Fixes

* **web:** center new chat and show examples as cards ([#94](https://github.com/nedhmn/goat-format-chatbot/issues/94)) ([a898350](https://github.com/nedhmn/goat-format-chatbot/commit/a898350c7a357fb419d2c39b7e1d3bf8978f0ae8))


### Refactors

* **backend:** move chat and card logic into a model layer ([#98](https://github.com/nedhmn/goat-format-chatbot/issues/98)) ([61c233b](https://github.com/nedhmn/goat-format-chatbot/commit/61c233b86f55e980cdaaae54fab6437c3cc36220))
* **backend:** move ingest logic into the model layer ([#99](https://github.com/nedhmn/goat-format-chatbot/issues/99)) ([4aeb19e](https://github.com/nedhmn/goat-format-chatbot/commit/4aeb19efcc1bef0b7aa5a79e66a4e45f63972904))


### Documentation

* keep the license plain mit ([#131](https://github.com/nedhmn/goat-format-chatbot/issues/131)) ([86c2595](https://github.com/nedhmn/goat-format-chatbot/commit/86c2595009658e0a8f634f11d29ebf27a1524c74))
* record the architecture and stack decisions ([#22](https://github.com/nedhmn/goat-format-chatbot/issues/22)) ([928b12c](https://github.com/nedhmn/goat-format-chatbot/commit/928b12c51252dde8425d6879981a245c94aaba72))
* **skills:** add the brand skill for the design system ([#11](https://github.com/nedhmn/goat-format-chatbot/issues/11)) ([cad1e88](https://github.com/nedhmn/goat-format-chatbot/commit/cad1e88a63020a7bb334c53584acdd270f958cee))
* **skills:** check the pr title after editing it ([#18](https://github.com/nedhmn/goat-format-chatbot/issues/18)) ([90f63a1](https://github.com/nedhmn/goat-format-chatbot/commit/90f63a12b2c09140ec8802897cbc59c4d197bdec))
* **skills:** leave code review out of kickoff ([#14](https://github.com/nedhmn/goat-format-chatbot/issues/14)) ([6d3b97f](https://github.com/nedhmn/goat-format-chatbot/commit/6d3b97fe9cd2dbe876e2b5891b339395ea9856ad))
* update the readme and skills to the current layout ([#27](https://github.com/nedhmn/goat-format-chatbot/issues/27)) ([a7cead9](https://github.com/nedhmn/goat-format-chatbot/commit/a7cead94bf64f409c31dfda9ca556dbbaef76398))
* **web:** document the web app structure and enforce it with lint ([#46](https://github.com/nedhmn/goat-format-chatbot/issues/46)) ([670c210](https://github.com/nedhmn/goat-format-chatbot/commit/670c210f5ee0efc1802516ce4b0c7dfc4cecc845))
