---
pageid: 1895792682
title: Testing md2confluence
---

The Obj (Objectives) tab in KM - Data allows designers to specify objectives that are used to determine if quest steps have completed. There are currently four different types of objectives which are distinguished in KM - Data by their subkind: `client`, `requirement`, `trigger` and `time`.

This document covers existing objectives, new objectives should be individually requested via JIRA.

## client

client objectives are the only type of objective which is not server-authoritative. The client is free to tell the server at any time that a client objective has been completed and the server will always believe it. This is done via the command `quest/client-trigger`. The fields of a client objective are defined by the client and are not covered in this document.

## requirement

requirement objectives check the state of various things in the players account. For example, their current inventory levels or their current buildings. Requirement objectives are always driven off a high-water mark. For example, imagine a quest that has a requirement objective that the player has 20 swordsman. If the quest were to start when the player has 15 swordsman in their inventory, then the quest would immediately be 15/20 complete. If they built 5 more swordsman, the quest would then complete as their total inventory was now 20. By contrast a trigger objective for 20 swordsman would have started in the 0/20 state and would have moved to 5/20 as it only looks at changes in the inventory while the quest is active.

A given requirement objective may be configured with entity and prototype filters. This table shows which filter(s) will be applied when using a given requirement.

| Description |         entityFilter           |  prototypeFilter   |                                              Notes                                              |
| :---------: | :----------------------------: | :----------------: | :---------------------------------------------------------------------------------------------: |
|  Inventory  | X<br />(player, city, armies)  |   X<br/>(item)     | count is the largest number of items in inventory, including custom items, in any single entity |
|  Buildings  |         X<br />(city)          |   X<br/>(item)     |              count is the number of that exact building in the player's home city               |
|  Research   |        X<br />(player)         |   X<br/>(tech)     |                       count is always 0 or 1 (not completed or completed)                       |
| Hero Level  | X<br />(player, city, armies)  | X<br/>(hero level) |   count is the largest number of a hero with that level in any single entity (likely 0 or 1)    |
|  Hero Rank  | X<br />(player, city, armies)  | X<br/>(hero rank)  |    count is the largest number of a hero with that rank in any single entity (likely 0 or 1)    |
| Noble Level |                                |   X<br/>(elite)    |              count is the number of nobles with the specified level in the parcel               |

## time

time objectives check that a particular amount of time has passed since the quest step became active. Once the required amount of time has elapsed (measured in seconds), the quest step is automatically completed.

## triggers

trigger objectives check that a particular event happens while the quest step is active. A given trigger may be configured with entity, prototype, relationship, and/or combat filters. This table shows which filter(s) will be applied when using a given trigger. Filters without an X will be silently ignored (so don't fill them in).

| Trigger Name      |     entityFilter      |        prototypeFilter        |        relationshipFilter [^2]        |         objectiveFilter          | Notes                                                  |
| :---------------- | :-------------------: | :---------------------------: | :-----------------------------------: | :------------------------------: | :----------------------------------------------------- |
| activateItem      |    X<br/>(target)     |         X<br/>(item )         |                                       |                                  | triggered when a consumable item is activated          |
| activityComplete  |    X<br/>(target)     |      X<br/>(interaction)      |        X<br/>(source → target)        |                                  | triggered when elite interaction completes             |
| activityFail      |    X<br/>(target)     |      X<br/>(interaction)      |        X<br/>(source → target)        |                                  | triggered when elite interaction fails                 |
| activitySucceed   |    X<br/>(target)     |      X<br/>(interaction)      |        X<br/>(source → target)        |                                  | triggered when elite interaction succeeds              |
| allianceJoined    |                       |                               |                                       |                                  |                                                        |
| allianceHelpGiven |                       |                               |                                       |                                  | triggered when player gives alliance help              |
| chestOpen         |    X<br/>(player)     |         X<br/>(chest)         |                                       |                                  |                                                        |
| cityConquer       |     X<br/>(city)      |                               |        X<br/>(player → city)          |                                  |                                                        |
| cityRelocate      |     X<br/>(city)      |                               |                                       |                                  | triggered at the end of a voluntary relocation         |
| collectItem       |                       |         X<br/>(item)          |                                       |                                  |                                                        |
| combatReinforce   |  X<br/>(side leader)  |                               |     X<br/>(joiner → side leader)      |        X<br/>combatRoles         |                                                        |
| combatWin         |   X<br/>(defender)    | X<br/>(defender city or camp) |      X<br/>(attacker → defender)      |        X<br/>combatRoles         | only triggered if attacker wins                        |
| defendsuccess     |   X<br/>(attacker)    |       X<br/>(attacker)        |      X<br/>(defender → attacker)      |        X<br/>combatRoles         | only triggered if defender wins                        |
| dungeonRun        |    X<br/>(crawler)    |        X<br/>(dungeon)        |                                       |                                  | triggered at start of dungeon crawl (per spec)         |
| dungeonComplete   | X<br/>(crawl leader)  |        X<br/>(dungeon)        |                                       |          X<br/>roomsWon          | only triggered if a number of dungeon rooms completed  |
| dungeonWin        | X<br/>(crawl leader)  |        X<br/>(dungeon)        |                                       |                                  | only triggered if dungeon is completely won            |
| eliteAdvance      |           X           |         X<br/>(role)          |                                       |                                  |                                                        |
| eliteBorn         |     X<br/>(baby)      |         X<br/>(baby)          |                                       |                                  |                                                        |
| eliteBornTo       |   X<br/>(parent 1)    |         X<br/>(baby)          |           X<br/>(parent 2)            |                                  |                                                        |
| eliteItemEquipped |           X           |               X               |                                       |                                  |                                                        |
| eliteLevel        |           X           |         X<br/>(role)          |                                       |                                  |                                                        |
| eliteOblation     |           X           |                               |                                       |                                  |                                                        |
| elitePromote      |           X           |         X<br/>(role)          |                                       |                                  |                                                        |
| eliteSacrifice    |           X           |                               |                                       |                                  |                                                        |
| eliteTalent       |           X           |        X<br/>(talent)         |                                       |                                  |                                                        |
| gainPoints        |           X           |         X<br/>(item)          |                                       |           X<br/>queues           | triggered in various places including queue completion |
| gainResource      |   X<br/>(recipient)   |         X<br/>(item)          |                                       | X<br/>reasons<br/>excludeReasons | triggered for any thing added to inventory             |
| goldPurchase      |                       |     X<br/>(store package)     |                                       |                                  |                                                        |
| goldSpendGeneral  |                       |               X               |                                       |                                  |                                                        |
| goldSpendSpeedup  |                       |               X               |                                       |                                  |                                                        |
| healUnit          |   X<br/>(army/city)   |         X<br/>(unit)          |                                       |                                  | triggered when a unit is healed                        |
| heroLevel         |                       |      X<br/>(hero level)       |                                       |                                  | triggered when a hero is leveled                       |
| heroPromote       |                       |       X<br/>(hero rank)       |                                       |                                  | triggered when a hero is promoted                      |
| heroUnlock        |                       |       X<br/>(hero rank)       |                                       |                                  | triggered when a hero is first unlocked (created)      |
| killUnit          |   X<br/>(defender)    |         X<br/>(unit)          |                                       |        X<br/>combatRoles         | unit/count killed by each player [^1]                  |
| login             |                       |                               |                                       |                                  |                                                        |
| mineComplete      |                       |     X<br/>(mine resource)     |                                       |                                  | trigged when mining completes and the army returns     |
| powerGain         |    X<br/>(player)     |                               |                                       |                                  |                                                        |
| proposeAccept     |    X<br/>(source)     |                               |       X<br/>(source → target)         |                                  |                                                        |
| queueComplete     |           X           |               X               |                                       |                                  | triggered for each segment of a multi-segment queue    |
| roomBoost         |     X<br/>(elite)     |         X<br/>(room)          |         X<br/>(elite → city)          |                                  | triggered by start of room boost                       |
| roomGuard         |     X<br/>(elite)     |         X<br/>(room)          |         X<br/>(elite → city)          |                                  | triggered by start of room guard                       |
| roomHelp          |     X<br/>(elite)     |         X<br/>(room)          |         X<br/>(elite → city)          |                                  | triggered by start of room help                        |
| spendResource     |    X<br/>(spender)    |         X<br/>(item)          |                                       | X<br/>reasons<br/>excludeReasons | triggered for anything removed from inventory          |
| taskComplete      |    X<br/>(source)     |         X<br/>(task)          |       X<br/>(source → target)         |                                  | triggered by a task (usually a trade) completing       |
| taskStart         |    X<br/>(source)     |         X<br/>(task)          |       X<br/>(source → target)         |                                  | triggered by a task (usually a trade) starting         |
| transmuteComplete |                       |               X               |                                       |                                  |                                                        |
| tributeSend       | X<br/>(target player) |                               | X<br/>(source elite → target player)  |                                  |                                                        |
| parcelOwnership   |  X<br/>(parkedCity)   |        X<br/>(capital)        |                                       |                                  | triggered when the player owns a capital               |

[1] killUnit does not credit kills against a member of one's own alliance

[2] Possible relationships (can be prefixed with **!**):
```
self    -- source and target are the same entity (entity is synonym)
local   -- source and target occupy same parcel
player  -- source and target have same owner
home    -- one is a city with same owner
family  -- neither are cities, but have same owner
member  -- one is an alliance, other is member it
allies  -- both belong to the same alliance (alliance is synonym)
foreign -- not same owner and not allies
married -- source and target are married to each other
```

### Objective Filters

Some objective triggers have additional metadata that can be filtered against using the objectiveFilter columns in data. If a specific trigger supports that, the available fields are documented in the table above. You can find the description of those filters here:

| Objective Filter Field | Notes                                                                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------ |
| combatRoles            | comma-separated list of combat roles - attacker, attackersupport, defender, defendersupport       |
| reasons                | comma-separated list of reasons for gaining/spending resources (see extended list below)          |
| excludeReasons         | comma-separated list of excluded reasons for gaining/spending resources (see extended list below) |
| queues                 | comma-separated list of queue names for gainpoints trigger                                        |
| roomsWon               | defined the minimum or range [min,max] of rooms to be completed to for dungeoncomplete trigger    |

| Reason                               | Gain/Spend | Notes      |
| :----------------------------------- | :--------- | :--------- |
| army_battalion_removed               | gain       |            |
| army_equipment_removed               | gain       |            |
| army_removed                         | gain       |            |
| battalion_equipment_removed          | gain       |            |
| cheat_city                           | gain       |            |
| cheat_items                          | gain       |            |
| cheat_stats                          | gain       |            |
| combat_reward                        | gain       |            |
| converation_reward                   | gain       |            |
| dungeon_elite_penalty                | gain       |            |
| dungeon_elite_reward                 | gain       |            |
| dungeon_player_reward                | gain       |            |
| elite_creation                       | gain       |            |
| elite_item                           | gain       |            |
| elite_level                          | gain       |            |
| garrison_excess_troops               | gain       |            |
| garrison_injured                     | gain       |            |
| garrison_removed_before_pay          | gain       |            |
| garrison_removed_from_blocking_tower | gain       |            |
| generator_adding_population          | gain       |            |
| generator_collect_building           | gain       |            |
| generator_reduction_in_stored_cap    | gain       |            |
| generator_uncollected_from_obsolete  | gain       |            |
| heist                                | gain       |            |
| create_hero                          | gain       |            |
| loot_city                            | gain       | deprecated |
| loot_pvp_city                        | gain       |            |
| loot_npc_city                        | gain       |            |
| migration                            | gain       |            |
| mine_collect                         | gain       |            |
| open_chest                           | gain       |            |
| pillage_crops                        | gain       |            |
| plot_harvest                         | gain       |            |
| potion                               | gain       |            |
| quest_reward                         | gain       |            |
| ransom                               | gain       |            |
| research_reward                      | gain       |            |
| sacrifice                            | gain       |            |
| spell_charge                         | gain       |            |
| steal_identity                       | gain       |            |
| quest_step_reward                    | gain       |            |
| store_gift                           | gain       |            |
| store_purchase                       | gain       |            |
| task_cancel                          | gain       |            |
| task_reward                          | gain       |            |
| transact_items                       | gain       |            |
| transmute_items                      | gain       |            |
| tribute_accepted                     | gain       |            |
| tribute_delivered                    | gain       |            |
| troops_heal                          | gain       |            |
| action_rss                           | spend      |            |
| activate_item                        | spend      |            |
| activate_speedups                    | spend      |            |
| army_banner_added                    | spend      |            |
| army_battalion_added                 | spend      |            |
| army_equipment_added                 | spend      |            |
| army_deployment_cost                 | spend      |            |
| army_heal                            | spend      |            |
| battalion_equipment_added            | spend      |            |
| blueprint_cost                       | spend      |            |
| building_upgrade                     | spend      |            |
| cheat_items                          | spend      |            |
| customization                        | spend      |            |
| elite_crawl                          | spend      |            |
| elite_item                           | spend      |            |
| elite_level                          | spend      |            |
| elite_set_role                       | spend      |            |
| elite_advance_role                   | spend      |            |
| garrison_troops                      | spend      |            |
| heist                                | spend      |            |
| hero_level                           | spend      |            |
| hero_promote                         | spend      |            |
| hero_unlock                          | spend      |            |
| item_applied                         | spend      |            |
| open_chest                           | spend      |            |
| ransom                               | spend      |            |
| relocation_cost                      | spend      |            |
| research_cost                        | spend      |            |
| role_level                           | spend      |            |
| sacrifice                            | spend      |            |
| steal_identity                       | spend      |            |
| quest_step_reward                    | spend      |            |
| stolen_loot                          | spend      |            |
| talent_learn                         | spend      |            |
| task_start                           | spend      |            |
| transact_items                       | spend      |            |
| transmute_items                      | spend      |            |
| tribute_cost                         | spend      |            |
| tribute_items                        | spend      |            |
| troops_dismissed                     | spend      |            |
| troops_heal                          | spend      |            |
